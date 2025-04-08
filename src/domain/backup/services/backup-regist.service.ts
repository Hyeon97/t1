import { ServiceError } from "../../../errors/service/service-error"
import { BaseService } from "../../../utils/base/base-service"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerPartitionService } from "../../server/services/server-partition.service"
import { ServerService } from "../../server/services/server.service"
import { ServerBasicTable } from "../../server/types/db/server-basic"
import { ServerPartitionTable } from "../../server/types/db/server-partition"
import { ZdmRepositoryService } from "../../zdm/services/zdm.repository.service"
import { ZdmService } from "../../zdm/services/zdm.service"
import { BackupRegistRequestBody } from "../types/backup-regist.type"
import { BackupService } from "./backup.service"


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
  // private createBackupObject({ data }: { data: BackupRegistRequestBody }): BackupTableInput {
  //   try {
  //     return {
  //       nUserID: data.nUserID,
  //       nCenterID: data.nCenterID,
  //       sSystemName: data.sSystemName,
  //       sJobName: data.sJobName,
  //       nJobID: data.nJobID,
  //       nJobStatus: data.nJobStatus,
  //       nScheduleID: data.nScheduleID,
  //       nScheduleID_advanced: data.nScheduleID_advanced,
  //       sJobResult: data.sJobResult,
  //       sDescription: data.sDescription,
  //       sStartTime: data.sStartTime,
  //       sLastUpdateTime: data.sLastUpdateTime,
  //     }
  //   } catch (error: any) {
  //     logger.debug("BackupRegistService.createBackupObject() 오류 발생")
  //     throw JobError.getDataError({
  //       message: error.message,
  //       logMessage: ["Backup 정보 등록 중 BackupRegistService.createBackupObject() 오류 발생", error.logMessage],
  //     })
  //   }
  // }

  /**
   * Backup info Object 생성
   */
  // private createBackupInfoObject({ data }: { data: BackupRegistRequestBody }): BackupInfoTableInput {
  //   try {
  //   } catch (error: any) {
  //     logger.debug("BackupRegistService.createBackupInfoObject() 오류 발생")
  //     throw JobError.getDataError({
  //       message: error.message,
  //       logMessage: ["Backup 정보 등록 중 BackupRegistService.createBackupObject() 오류 발생", error.logMessage],
  //     })
  //   }
  // }

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
        message: "Backup 정보 등록 중 Server 정보 조회 중 오류 발생",
      })
      // throw new JobError.DataRetrievalError({
      //   operation: "백업 등록",
      //   dataType: "서버 정보",
      //   reason: error instanceof Error ? error.message : String(error),
      // })
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
        message: "Backup 정보 등록 중 Server Partition 정보 조회 중 오류 발생",
      })
    }
  }

  /**
   * center 정보 가져오기
   */
  // private async getCenterInfo({ center }: { center: number | string }): Promise<CenterInfoTable> {
  //   try {
  //     let centerInfo = null
  //     if (typeof center === "number") {
  //       centerInfo = await this.zdmService.getZDMById({ id: center, filterOptions: {} })
  //     } else if (typeof center === "string") {
  //       centerInfo = await this.zdmService.getZDMByName({ name: center, filterOptions: {} })
  //     }
  //     return centerInfo?.zdm!
  //   } catch (error) {
  //     ContextLogger.error({
  //       message: "Backup 정보 등록 중 BackupRegistService.getCenterInfo() 오류 발생",
  //       meta: { error: error instanceof Error ? error.message : String(error), },
  //     })
  //     if (error instanceof Error) {
  //       throw new JobError.DataRetrievalError({
  //         message: '작업 대상 Center 정보 조회중 에러 발생'
  //       })
  //     }
  //     else throw error
  //   }
  // }

  /**
   * repository 정보 가져오기
   */
  // private async getRepositoryInfo({ repository, center }: { repository: BackupRegistRequestRepository; center: CenterInfoTable }) {
  //   try {
  //     const filterOptions: ZDMRepositoryFilterOptions = {
  //       center: center.nID,
  //       type: repository.type || "",
  //       path: repository.path || "",
  //     }
  //     const repositoryInfo = await this.zdmRepositoryService.getRepositoryById({ id: repository.id, filterOptions })
  //     return repositoryInfo.items[0]
  //   } catch (error) {
  //     ContextLogger.error({
  //       message: "Backup 정보 등록 중 BackupRegistService.getRepositoryInfo() 오류 발생",
  //       meta: { error: error instanceof Error ? error.message : String(error), },
  //     })
  //     if (error instanceof Error) {
  //       throw new JobError.DataRetrievalError({
  //         message: '작업 대상 Center Repository 정보 조회중 에러 발생'
  //       })
  //     }
  //     else throw error
  //   }
  // }

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
      // //  center 정보 가져오기
      // const center = await this.getCenterInfo({ center: data.center })
      // //  repository 정보 가져오기
      // const repository = await this.getRepositoryInfo({ repository: data.repository, center })
      //  schedule 정보 가져오기
      const dataSet = []
      //  사용자 지정 파티션만 등록
      if (data.partition.length) {
        data.partition.forEach((partition) => {
          const partitionInfo = partitionList.find((item) => item.sLetter === partition)
          if (!partitionInfo) {
            throw ServiceError.badRequestError({
              functionName: 'regist',
              message: `파티션( ${partition} )이 서버( ${server.sSystemName} )에 존재하지 않습니다`,
              metadata: {
                partition,
                server: server.sSystemName,
              }
            })
          }
          dataSet.push({
            // nUserID: data.nUserID,
            // nCenterID: data.center,
            // sSystemName: server.sSystemName,
            // sPartitionName: partition,
            // nPartitionID: partitionInfo.nID,
            // nRepositoryID: repository.nID,
            // nScheduleID: data.nScheduleID,
            // nScheduleID_advanced: data.nScheduleID_advanced,
            // sJobName: data.sJobName,
            // nJobID: data.nJobID,
            // nJobStatus: data.nJobStatus,
            // sJobResult: data.sJobResult,
            // sDescription: data.sDescription,
            // sStartTime: data.sStartTime,
            // sLastUpdateTime: data.sLastUpdateTime,
          })
        })
      }
      //  해당 서버 파티션 전체 등록
      else {
        // console.dir(partitionList, { depth: null })
      }
      const backupInputObject = {}
      const backupInfoInputObject = {}
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "regist",
        message: `백업 정보 등록 중 오류가 발생했습니다`,
      })
    }
  }
}
