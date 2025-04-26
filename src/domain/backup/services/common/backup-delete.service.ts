import { TransactionManager } from "../../../../database/connection"
import { RepositoryError } from "../../../../errors"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseService } from "../../../../utils/base/base-service"
import { BackupHistoryRepository } from "../../repositories/backup-history.repository"
import { BackupInfoRepository } from "../../repositories/backup-info.repository"
import { BackupLogRepository } from "../../repositories/backup-log-event.repository"
import { BackupRepository } from "../../repositories/backup.repository"
import { BackupDataDeleteResponse } from "../../types/backup-response.type"

//  Backup Data 삭제 결과 DataSet
type BackupDataDeleteSet = PromiseSettledResult<any> & { type: string }

//  Backup Data 삭제 결과
interface BackupDataDeleteResultSet {
  mainResults: Array<BackupDataDeleteSet>
  additionalResults: Array<BackupDataDeleteSet>
}

export class BackupDeleteService extends BaseService {
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository
  private readonly backupLogRepository: BackupLogRepository
  private readonly backupHistoryRepository: BackupHistoryRepository

  constructor({
    backupRepository,
    backupInfoRepository,
    backupLogRepository,
    backupHistoryRepository,
  }: {
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
   * 결과 확인 및 출력 결과 가공
   */
  private processResult({ data, jobName, jobId }: { data: BackupDataDeleteResultSet; jobName?: string; jobId?: number }): BackupDataDeleteResponse {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processResult", state: "start" })
      let returnObject: BackupDataDeleteResponse | null = null
      const mainResult = data.mainResults.filter((el) => el.status === "fulfilled").length === 2 ? "success" : "false"
      const log = data.additionalResults.find((el) => el.type === "Log") ?? null
      const logResult = !log ? "fail" : log.status === "fulfilled" ? "success" : "fail"
      const history = data.additionalResults.find((el) => el.type === "History") ?? null
      const historyResult = !history ? "fail" : history.status === "fulfilled" ? "success" : "fail"

      if (jobName) {
        returnObject = {
          job_name: jobName,
          delete_state: {
            data: mainResult,
            log: logResult,
            history: historyResult,
          },
        }
      } else {
        returnObject = {
          job_id: String(jobId),
          delete_state: {
            data: mainResult,
            log: logResult,
            history: historyResult,
          },
        }
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processResult", state: "end" })
      return returnObject
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "processResult",
        message: `[Backup 이름으로 삭제] - 출력데이터 생성 실패`,
      })
    }
  }

  /**
   * Backup 작업 이름으로 삭제
   */
  async deleteByJobName({ jobName }: { jobName: string }): Promise<BackupDataDeleteResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "deleteByJobName", state: "start" })
      // 트랜잭션 직접 실행
      const transactionResult = await TransactionManager.execute({
        callback: async (transaction) => {
          // 필수 작업 세트 (함께 성공해야 함)
          const mainTasks = [
            { repo: this.backupRepository, type: "Main" },
            { repo: this.backupInfoRepository, type: "Info" },
          ]

          // 필수 작업 세트 실행
          const mainResults: BackupDataDeleteSet[] = await Promise.all(
            mainTasks.map(async (task) => {
              try {
                const result = await task.repo.deleteByJobName({ jobName, transaction })
                return { status: "fulfilled", value: result, type: task.type }
              } catch (error) {
                return { status: "rejected", reason: error, type: task.type }
              }
            })
          )

          // 필수 작업 세트의 결과가 둘다 성공이 아니면 error 리턴
          // 필수 작업 세트의 실패 항목 식별 (소스 정보 포함)
          const mainFailures = mainResults.filter((item) => item.status === "rejected")
          if (mainFailures.length > 0) {
            const failedItem = mainFailures[0]
            const message = `Backup ${failedItem.type} Data 삭제 실패`
            throw RepositoryError.deletionError({
              method: "deleteByJobName",
              message,
              error: failedItem.reason.metadata?.error || failedItem.reason,
            })
          }

          // 부가 작업 정의 및 실행
          const additionalTasks = [
            { repo: this.backupLogRepository, type: "Log" },
            { repo: this.backupHistoryRepository, type: "History" },
          ]

          // 부가 작업도 메타데이터와 함께 매핑
          const additionalResults: BackupDataDeleteSet[] = await Promise.all(
            additionalTasks.map(async (task) => {
              try {
                const result = await task.repo.deleteByJobName({ jobName, transaction })
                return { status: "fulfilled", value: result, type: task.type }
              } catch (error) {
                return { status: "rejected", reason: error, type: task.type }
              }
            })
          )

          // 모든 결과를 합쳐서 반환
          return {
            mainResults,
            additionalResults,
          }
        },
      })
      const result = this.processResult({ data: transactionResult, jobName })
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
  async deleteBackupByJobId({ jobId }: { jobId: number }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "deleteBackupByJobId", state: "start" })
      // 트랜잭션 직접 실행
      const transactionResult = await TransactionManager.execute({
        callback: async (transaction) => {
          // 필수 작업 세트 (함께 성공해야 함)
          const mainTasks = [
            { repo: this.backupRepository, type: "Main" },
            { repo: this.backupInfoRepository, type: "Info" },
          ]

          // 필수 작업 세트 실행
          const mainResults: BackupDataDeleteSet[] = await Promise.all(
            mainTasks.map(async (task) => {
              try {
                const result = await task.repo.deleteByJobId({ jobId, transaction })
                return { status: "fulfilled", value: result, type: task.type }
              } catch (error) {
                return { status: "rejected", reason: error, type: task.type }
              }
            })
          )

          // 필수 작업 세트의 결과가 둘다 성공이 아니면 error 리턴
          // 필수 작업 세트의 실패 항목 식별 (소스 정보 포함)
          const mainFailures = mainResults.filter((item) => item.status === "rejected")
          if (mainFailures.length > 0) {
            const failedItem = mainFailures[0]
            const message = `Backup ${failedItem.type} Data 삭제 실패`
            throw RepositoryError.deletionError({
              method: "deleteByJobId",
              message,
              error: failedItem.reason.metadata?.error || failedItem.reason,
            })
          }

          // 부가 작업 정의 및 실행
          const additionalTasks = [
            { repo: this.backupLogRepository, type: "Log" },
            { repo: this.backupHistoryRepository, type: "History" },
          ]

          // 부가 작업도 메타데이터와 함께 매핑
          const additionalResults: BackupDataDeleteSet[] = await Promise.all(
            additionalTasks.map(async (task) => {
              try {
                const result = await task.repo.deleteByJobId({ jobId, transaction })
                return { status: "fulfilled", value: result, type: task.type }
              } catch (error) {
                return { status: "rejected", reason: error, type: task.type }
              }
            })
          )

          // 모든 결과를 합쳐서 반환
          return {
            mainResults,
            additionalResults,
          }
        },
      })
      const result = this.processResult({ data: transactionResult, jobId })
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
