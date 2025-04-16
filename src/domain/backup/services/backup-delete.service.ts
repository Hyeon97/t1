import { ServiceError } from "../../../errors"
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
          // 필수 작업 세트 (함께 성공해야 함)
          const mainDeletions = await Promise.allSettled([
            //  backup data 삭제
            this.backupRepository.deleteByJobName({ jobName, transaction }),
            //  backup info data 삭제
            this.backupInfoRepository.deleteByJobName({ jobName, transaction })
          ])

          // 필수 작업 세트의 결과가 둘다 성공이 아니면 error 리턴
          const mainFailures = mainDeletions.filter(result => result.status === 'rejected')
          if (mainFailures.length > 0) {
            console.dir(mainFailures[0].reason, { depth: null })

            // throw new Error(`필수 백업 데이터 삭제 실패: ${errors.join(', ')}`)
            const message = ''
            throw ServiceError.deletionError({ method: 'deleteByJobName', message, cause: mainFailures[0].reason, })
          }

          // 나머지 작업들 (독립적으로 실행될 수 있음)
          const additionalResults = await Promise.allSettled([
            //  backup log 삭제
            this.backupLogRepository.deleteByJobName({ jobName, transaction }),
            //  backup history 삭제
            this.backupHistoryRepository.deleteByJobName({ jobName, transaction })
          ])

          // 모든 결과를 합쳐서 반환
          return {
            mainDeletions,
            additionalResults
          }
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
