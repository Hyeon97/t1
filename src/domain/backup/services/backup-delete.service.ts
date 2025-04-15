import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { BackupHistoryRepository } from "../repositories/backup-history"
import { BackupInfoRepository } from "../repositories/backup-info.repository"
import { BackupLogRepository } from "../repositories/backup-log-event"
import { BackupRepository } from "../repositories/backup.repository"
import { BackupDeleteOptions } from "../types/backup-delete.type"

export class BackupDeleteService extends BaseService {
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository
  private readonly backupLogRepository: BackupLogRepository
  private readonly backupHistoryRepository: BackupHistoryRepository

  constructor({ backupRepository,
    backupInfoRepository,
    backupLogRepository,
    backupHistoryRepository }: {
      backupRepository: BackupRepository
      backupInfoRepository: BackupInfoRepository
      backupLogRepository: BackupLogRepository
      backupHistoryRepository: BackupHistoryRepository
    }) {
    super({
      serviceName: "BackupDeleteService",
    })
    this.backupRepository = backupRepository
    this.backupInfoRepository = backupInfoRepository
    this.backupLogRepository = backupLogRepository
    this.backupHistoryRepository = backupHistoryRepository
  }

  /**
   * Backup 작업 이름으로 삭제
   */
  // Promise<BackupDataResponse[]>
  async deleteByJobName({ filterOptions, jobName }: { filterOptions: BackupDeleteOptions, jobName: string }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "deleteByJobName", state: "start" })
      const result = await this.executeTransaction({
        callback: async (transaction) => {
          //  backup 정보 삭제
          await this.backupRepository.deleteByJobName({ jobName, transaction })
          //  backup info 정보 삭제
          await this.backupInfoRepository.deleteByJobName({ jobName, transaction })
          //  backup log 정보 삭제
          await this.backupLogRepository.deleteByJobName({ jobName, transaction })
          //  backup history 정보 삭제
          await this.backupHistoryRepository.deleteByJobName({ jobName, transaction })
        }
      })
      console.dir(result, { depth: null })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "deleteByJobName", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "deleteByJobName",
        message: `[Backup 이름으로 삭제] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * Backup 작업 ID로 삭제
   */
  async deleteBackupByJobId({ filterOptions, id }: { filterOptions: BackupDeleteOptions, id: number }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "deleteBackupByJobId", state: "start" })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "deleteBackupByJobId", state: "end" })
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "deleteBackupByJobId",
        message: `[Backup ID로 삭제] - 오류가 발생했습니다`,
      })
    }
  }
  // /**
  //  * Backup 작업 서버 이름으로 삭제 ( source, target 구분 X? )
  //  */
  // deleteBySystenName({ filterOptions }: { filterOptions: BackupDeleteOptions }): Promise<BackupDataResponse[]> {}
}
