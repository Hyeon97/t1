import { ServiceError } from "../../../errors/service/service-error"
import { CompressionTypeMap } from "../../../types/common/compression"
import { EncryptionTypeMap } from "../../../types/common/encryption"
import { BaseService } from "../../../utils/base/base-service"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerPartitionService } from "../../server/services/server-partition.service"
import { ServerService } from "../../server/services/server.service"
import { ServerBasicTable } from "../../server/types/db/server-basic"
import { ServerPartitionTable } from "../../server/types/db/server-partition"
import { ZdmRepositoryService } from "../../zdm/services/zdm.repository.service"
import { ZdmService } from "../../zdm/services/zdm.service"
import { ZdmInfoTable } from "../../zdm/types/db/center-info"
import { ZdmRepositoryTable } from "../../zdm/types/db/center-repository"
import { ZdmRepositoryFilterOptions } from "../../zdm/types/zdm-repository/zdm-repository-filter.type"
import { BackupTypeMap } from "../types/backup-common.type"
import { BackupRegistRequestBody, BackupTableInput, BackupInfoTableInput, BackupRegistRequestRepository } from "../types/backup-regist.type"
import { BackupService } from "./backup.service"

//  Backup Data 등록 DataSet 배열 Type
interface BackupDataSet {
  backupDataObject: BackupTableInput
  backupInfoDataObject: BackupInfoTableInput
}

export class BackupRegistService extends BaseService {
  private readonly serverService: ServerService
  private readonly serverPartitionService: ServerPartitionService
  private readonly zdmService: ZdmService
  private readonly zdmRepositoryService: ZdmRepositoryService
  private readonly backupService: BackupService
  constructor({
    serverService,
    serverPartitionService,
    zdmService,
    zdmRepositoryService,
    backupService,
  }: {
    serverService: ServerService
    serverPartitionService: ServerPartitionService
    zdmService: ZdmService
    zdmRepositoryService: ZdmRepositoryService
    backupService: BackupService
  }) {
    super({
      serviceName: "BackupRegistService",
    })
    this.serverService = serverService
    this.serverPartitionService = serverPartitionService
    this.zdmService = zdmService
    this.zdmRepositoryService = zdmRepositoryService
    this.backupService = backupService
  }

  /**
   * Backup Object 생성
   */
  private createBackupObject({
    data,
    server,
    center,
  }: {
    data: BackupRegistRequestBody
    server: ServerBasicTable
    center: ZdmInfoTable
  }): BackupTableInput {
    try {
      return {
        nUserID: data.user as number,
        nCenterID: center.nID,
        sSystemName: server.sSystemName,
        sJobName: data.jobName || "",
        nJobID: 0,
        nJobStatus: data.autoStart === "use" ? 3 : 2,
        nScheduleID: 0,
        nScheduleID_advanced: 0,
        sJobResult: "",
        sDescription: data.descroption || "",
        sStartTime: "",
        sLastUpdateTime: "",
      }
    } catch (error) {
      throw ServiceError.dataProcessingError({
        functionName: "createBackupObject",
        message: "[Backup 정보 등록] - Backup Object 생성 오류 발생",
        cause: error,
      })
    }
  }

  /**
   * Backup info Object 생성
   */
  private createBackupInfoObject({
    data,
    server,
    partition,
    center,
    repository,
  }: {
    data: BackupRegistRequestBody
    server: ServerBasicTable
    partition: ServerPartitionTable
    center: ZdmInfoTable
    repository: ZdmRepositoryTable
  }): BackupInfoTableInput {
    try {
      return {
        nID: 0,
        nUserID: data.user as number,
        nCenterID: center.nID,
        sSystemName: server.sSystemName,
        sJobName: data.jobName || "",
        nBackupType: BackupTypeMap.fromString({ str: data.type }),
        nRotation: data.rotation ?? 1,
        nCompression: data.compression === "use" ? 1 : 0,
        nEncryption: data.encryption === "use" ? 1 : 0,
        sDrive: partition.sLetter,
        sExcludeDir: data.excludeDir as string, //  추후 수정 필요
        nEmailEvent: 0,
        sComment: "",
        nRepositoryID: repository.nID,
        nRepositoryType: repository.nType,
        sRepositoryPath: repository.sRemotePath,
        nNetworkLimit: data.networkLimit ?? 0,
        sLastUpdateTime: "",
      }
    } catch (error) {
      throw ServiceError.dataProcessingError({
        functionName: "createBackupInfoObject",
        message: "[Backup 정보 등록] - Backup Info Object 생성 오류 발생",
        cause: error,
      })
    }
  }

  /**
   *  서버 정보 가져오기
   */
  private async getServerInfo({ server }: { server: number | string }): Promise<ServerBasicTable> {
    try {
      let serverInfo = null
      if (typeof server === "number") {
        serverInfo = await this.serverService.getServerById({ id: String(server), filterOptions: {} })
      } else if (typeof server === "string") {
        serverInfo = await this.serverService.getServerByName({ name: server, filterOptions: {} })
      }
      return serverInfo?.server!
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getServerInfo",
        message: "[Backup 정보 등록] - Server 정보 조회 오류 발생",
      })
    }
  }

  /**
   * 서버 파티션 목록 가져오기
   */
  private async getServerPartitionList({ server }: { server: string }): Promise<ServerPartitionTable[]> {
    try {
      const partitionList = await this.serverPartitionService.getPartitionListByServerName({ name: server })
      return partitionList?.items!
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getServerPartitionList",
        message: "[Backup 정보 등록] - Server Partition 정보 조회 오류 발생",
      })
    }
  }

  /**
   * center 정보 가져오기
   */
  private async getCenterInfo({ center }: { center: number | string }): Promise<ZdmInfoTable> {
    try {
      let centerInfo = null
      if (typeof center === "number") {
        centerInfo = await this.zdmService.getZdmById({ id: String(center), filterOptions: {} })
      } else if (typeof center === "string") {
        centerInfo = await this.zdmService.getZdmByName({ name: center, filterOptions: {} })
      }
      return centerInfo?.zdm!
    } catch (error) {
      throw ServiceError.dataProcessingError({
        functionName: "getCenterInfo",
        message: "[Backup 정보 등록] - ZDM 정보 조회 오류 발생",
        cause: error,
      })
    }
  }

  /**
   * repository 정보 가져오기
   */
  private async getRepositoryInfo({ repository, center }: { repository: BackupRegistRequestRepository; center: ZdmInfoTable }) {
    try {
      const filterOptions: ZdmRepositoryFilterOptions = {
        center: center.nID,
        type: repository.type || "",
        path: repository.path || "",
      }
      const repositoryInfo = await this.zdmRepositoryService.getRepositoryById({ id: repository.id, filterOptions })
      return repositoryInfo.items[0]
    } catch (error) {
      throw ServiceError.dataProcessingError({
        functionName: "getRepositoryInfo",
        message: "[Backup 정보 등록] - ZDM Repository 정보 조회 오류 발생",
        cause: error,
      })
    }
  }

  /**
   * 데이터 전처리(작업이름 중복 검사 or 자동생성)
   */
  private async preprocessJobName({ jobName }: { jobName: string }): Promise<string> {
    try {
      //  작업 이름이 없는경우 - 자동생성
      //  작업 이름이 있는경우 - 중복검사 후 자동 idx 부여 or 증가
      return ""
    } catch (error) {
      throw ServiceError.dataProcessingError({
        functionName: "preprocessJobName",
        message: "[Backup 정보 등록] - Backup JobName 정보 가공 오류 발생",
        cause: error,
      })
    }
  }

  /**
   * 데이터 전처리(제외 파티션)
   */
  private preprocessExcludePartitions({ excludePartition }: { excludePartition: string }): string[] {
    try {
      // 문자열을 '|'로 분리
      const partitions = excludePartition.split("|")

      // 빈 문자열 항목 제거 및 트림 처리
      const validPartitions = partitions.map((partition) => partition.trim()).filter((partition) => partition.length > 0)

      return validPartitions
    } catch (error) {
      throw ServiceError.dataProcessingError({
        functionName: "preprocessExcludePartitions",
        message: "[Backup 정보 등록] - Exclude Partition 정보 가공 오류 발생",
        cause: error,
      })
    }
  }

  /**
   * 데이터 전처리(작업제외 디렉토리)
   */
  private preprocessExcludeDir({ excludeDir }: { excludeDir: string }): string[] {
    try {
      // 문자열을 '|'로 분리
      const dirs = excludeDir.split("|")

      // 빈 문자열 항목 제거 및 트림 처리
      const validPartitions = dirs.map((dir) => dir.trim()).filter((dir) => dir.length > 0)

      return validPartitions
    } catch (error) {
      throw ServiceError.dataProcessingError({
        functionName: "preprocessExcludeDir",
        message: "[Backup 정보 등록] - Exclude Dir 정보 가공 오류 발생",
        cause: error,
      })
    }
  }

  /**
   *  Backup 작업 등록
   */
  async regist({ data }: { data: BackupRegistRequestBody }) {
    try {
      ContextLogger.debug({ message: "Backup 작업 등록 시작", meta: { data } })

      //  server 정보 가져오기
      const server = await this.getServerInfo({ server: data.server })
      //  파티션 정보 가져오기
      const partitionList = await this.getServerPartitionList({ server: server.sSystemName })
      //  center 정보 가져오기
      const center = await this.getCenterInfo({ center: data.center })
      //  repository 정보 가져오기
      const repository = await this.getRepositoryInfo({ repository: data.repository, center })
      //  schedule 정보 가져오기

      //  데이터 전처리(작업이름 중복 검사 or 자동생성)
      data.jobName = await this.preprocessJobName({ jobName: data.jobName || "" })
      //  데이터 전처리(작업제외 파티션)
      if (data.excludePartition) {
        data.excludePartition = this.preprocessExcludePartitions({ excludePartition: data.excludePartition as string })
      }
      //  데이터 전처리(작업제외 디렉토리)
      if (data.excludeDir) {
        data.excludeDir = this.preprocessExcludeDir({ excludeDir: data.excludeDir as string })
      }

      const dataSet: BackupDataSet[] = []
      // 처리할 파티션 목록 결정
      const partitionsToProcess = data.partition.length
        ? data.partition.map((partition) => {
            const partitionInfo = partitionList.find((item) => item.sLetter === partition)

            if (!partitionInfo) {
              throw ServiceError.badRequestError({
                functionName: "regist",
                message: `파티션( ${partition} )이 서버( ${server.sSystemName} )에 존재하지 않습니다`,
                metadata: {
                  partition,
                  server: server.sSystemName,
                },
              })
            }

            return partitionInfo
          })
        : partitionList

      // 제외 파티션이 아닌 것들만 필터링 후 데이터셋 생성
      partitionsToProcess
        .filter((partition) => !data.excludePartition?.includes(partition.sLetter))
        .forEach((partition) => {
          const backupDataObject = this.createBackupObject({ data, server, center })
          const backupInfoDataObject = this.createBackupInfoObject({
            data,
            server,
            partition,
            center,
            repository,
          })
          dataSet.push({ backupDataObject, backupInfoDataObject })
        })
      ContextLogger.info({ message: `총 ${dataSet.length}개의 Backup 작업 등록 dataSet을 생성했습니다.` })
      //  데이터 등록
      //  결과 리턴
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "regist",
        message: `백업 정보 등록 - 오류가 발생했습니다`,
      })
    }
  }
}
