import { TransactionManager } from "../../../database/connection"
import { ServiceError } from "../../../errors/service/service-error"
import { AutoStartType } from "../../../types/common/job"
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
import { BackupInfoRepository } from "../repositories/backup-info.repository"
import { BackupRepository } from "../repositories/backup.repository"
import { BackupTypeMap } from "../types/backup-common.type"
import { BackupInfoTableInput, BackupRegistRequestBody, BackupRegistRequestRepository, BackupTableInput } from "../types/backup-regist.type"

//  Backup Data 등록 DataSet 배열 Type
interface BackupDataSet {
  backupDataObject: BackupTableInput
  backupInfoDataObject: BackupInfoTableInput
}
//  Backup Data 등록 결과 
interface BackupDataRegistResultSet {
  successful: Array<{ dataSet: BackupDataSet, }>,
  failed: Array<{ dataSet: BackupDataSet, error: Error }>
}

export class BackupRegistService extends BaseService {
  private readonly serverService: ServerService
  private readonly serverPartitionService: ServerPartitionService
  private readonly zdmService: ZdmService
  private readonly zdmRepositoryService: ZdmRepositoryService
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository

  constructor({
    serverService,
    serverPartitionService,
    zdmService,
    zdmRepositoryService,
    backupRepository,
    backupInfoRepository
  }: {
    serverService: ServerService
    serverPartitionService: ServerPartitionService
    zdmService: ZdmService
    zdmRepositoryService: ZdmRepositoryService
    backupRepository: BackupRepository
    backupInfoRepository: BackupInfoRepository
  }) {
    super({
      serviceName: "BackupRegistService",
    })
    this.serverService = serverService
    this.serverPartitionService = serverPartitionService
    this.zdmService = zdmService
    this.zdmRepositoryService = zdmRepositoryService
    this.backupRepository = backupRepository
    this.backupInfoRepository = backupInfoRepository
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
        nUserID: (data.user ?? 1) as number,
        nCenterID: center.nID,
        sSystemName: server.sSystemName,
        sJobName: data.jobName || "",
        nJobID: 0,
        nJobStatus: data.autoStart === "use" ? 3 : 2,
        nScheduleID: 0,
        nScheduleID_advanced: 0,
        sJobResult: "",
        sDescription: data.descroption || "",
        sStartTime: "now()",
        sLastUpdateTime: "now()",
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
        nUserID: (data.user ?? 1) as number,
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
      return this.handleServiceError({
        error,
        functionName: "getCenterInfo",
        message: "[Backup 정보 등록] - ZDM 정보 조회 오류 발생",
      })
      // throw ServiceError.dataProcessingError({
      //   functionName: "getCenterInfo",
      //   message: "[Backup 정보 등록] - ZDM 정보 조회 오류 발생",
      //   cause: error,
      // })
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
      return this.handleServiceError({
        error,
        functionName: "getRepositoryInfo",
        message: "[Backup 정보 등록] - ZDM Repository 정보 조회 오류 발생",
      })
      // throw ServiceError.dataProcessingError({
      //   functionName: "getRepositoryInfo",
      //   message: "[Backup 정보 등록] - ZDM Repository 정보 조회 오류 발생",
      //   cause: error,
      // })
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
 * Backup 데이터 세트 DB 등록
 */
  private async registerBackupDataSet({ dataSet, transaction }: { dataSet: BackupDataSet, transaction: TransactionManager }): Promise<BackupDataSet> {
    try {
      // 1. Backup 기본 정보 등록
      const backupRegistResult = await this.backupRepository.insertBackup({
        backupData: dataSet.backupDataObject,
        transaction
      })

      // 2. Backup 객체 nJobID 설정
      dataSet.backupDataObject.nJobID = backupRegistResult.insertId

      // 3. Backup 객체 업데이트
      const { sStartTime, sLastUpdateTime, ...backupDataWithoutTimeFields } = dataSet.backupDataObject
      await this.backupRepository.updateBackup({
        id: backupRegistResult.insertId,
        transaction,
        backupData: backupDataWithoutTimeFields
      })

      // 4. Backup info 객체에 ID 설정
      dataSet.backupInfoDataObject.nID = backupRegistResult.insertId

      // 5. Backup info 정보 등록
      const backupInfoRegistResult = await this.backupInfoRepository.insertBackupInfo({
        backupInfoData: dataSet.backupInfoDataObject,
        transaction
      })

      return dataSet
    } catch (error) {
      throw ServiceError.dataProcessingError({
        functionName: "registerBackupDataSet",
        message: "[Backup 정보 등록] - Backup / Backup Info 정보 DB등록 중 오류 발생",
        cause: error,
      })
    }
  }

  /**
   * 여러 Backup 데이터 세트 병렬 등록
   */
  private async registerAllBackupDataSets({ dataSets }: { dataSets: BackupDataSet[] }): Promise<BackupDataRegistResultSet> {
    const results = await Promise.allSettled(
      dataSets.map(dataSet =>
        this.executeTransaction({
          callback: async (transaction) => {
            return this.registerBackupDataSet({
              dataSet,
              transaction
            })
          },
        })
      )
    )

    const successful: Array<{ dataSet: BackupDataSet }> = []
    const failed: Array<{ dataSet: BackupDataSet, error: Error }> = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push({ dataSet: dataSets[index], })
      } else {
        failed.push({
          dataSet: dataSets[index],
          error: result.reason
        })
      }
    })

    return { successful, failed }
  }

  /**
   * 결과 확인 및 출력 결과 가공
   */
  // BackupDataRegistResponse
  private processResult({ data, autoStart }: { data: BackupDataRegistResultSet, autoStart: AutoStartType }) {
    const returnObject: any[] = []
    //  스케쥴 사용 여부
    const useSchedule = ({ data }: { data: BackupTableInput }) => {
      if (data.nScheduleID && data.nScheduleID_advanced) { return "Smart Schedule" }
      else if (data.nScheduleID && !data.nScheduleID_advanced) { return "Increment Schedule" }
      else if (!data.nScheduleID && data.nScheduleID_advanced) { return "Full Schedule" }
      else return "-"
    }
    //  성공한 작업
    data.successful.forEach((el) => {
      const d = el.dataSet
      returnObject.push({
        state: 'success',
        job_name: d.backupDataObject.sJobName,
        partition: d.backupInfoDataObject.sDrive,
        job_type: BackupTypeMap.toString({ value: d.backupInfoDataObject.nBackupType }),
        auto_start: autoStart,
        use_schedule: useSchedule({ data: d.backupDataObject })
      })
    })

    //  실패한 작업
    data.failed.forEach((el) => {
      const d = el.dataSet
      returnObject.push({
        state: 'fail',
        job_name: '-',
        partition: d.backupInfoDataObject.sDrive,
        job_type: '-',
        auto_start: '-',
        use_schedule: '-',
      })
    })
    return returnObject
  }

  /**
   *  Backup 작업 등록 Main
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
          //  사용자 입력 파티션 검증
          if (!partitionInfo) {
            throw ServiceError.badRequestError({
              functionName: "regist",
              message: `[Backup 정보 등록] - 파티션( ${partition} )이 서버( ${server.sSystemName} )에 존재하지 않습니다`,
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

      // 데이터 등록
      if (dataSet.length === 0) {
        throw ServiceError.badRequestError({
          functionName: "regist",
          message: "[Backup 정보 등록] - 등록할 Backup 작업이 없습니다. 파티션 정보를 확인해주세요.",
        })
      }

      const registrationResult = await this.registerAllBackupDataSets({ dataSets: dataSet })

      ContextLogger.info({
        message: `[Backup 정보 등록] - Backup 작업 등록 완료`,
        meta: {
          totalRequested: dataSet.length,
          successful: registrationResult.successful.length,
          failed: registrationResult.failed.length
        }
      })

      // 일부 등록이 실패한 경우 경고 로깅
      if (registrationResult.failed.length > 0) {
        ContextLogger.warn({
          message: `[Backup 정보 등록] - 일부 Backup 작업 등록에 실패했습니다`,
          meta: {
            failedCount: registrationResult.failed.length,
            errors: registrationResult.failed.map(f => ({
              partition: f.dataSet.backupInfoDataObject.sDrive,
              errorMessage: f.error instanceof Error ? f.error.message : String(f.error)
            }))
          }
        })
      }

      // 결과 리턴
      return this.processResult({ data: registrationResult, autoStart: data.autoStart! })
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "regist",
        message: `[Backup 정보 등록] - 오류가 발생했습니다`,
      })
    }
  }
}
