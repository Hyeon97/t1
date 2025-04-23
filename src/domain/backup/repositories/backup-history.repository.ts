import { ResultSetHeader } from "mysql2"
import { TransactionManager } from "../../../database/connection"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"

export class BackupHistoryRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "BackupHistoryRepository",
      tableName: "history_backup",
    })
  }

  /**
   * Backup 작업 History 삭제 ( by jobName )
   */
  async deleteByJobName({ jobName, transaction }: { jobName: string; transaction: TransactionManager }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteByJobName", state: "start" })

      const result = await this.delete({
        data: { sJobName: jobName },
        transaction,
        request: `${this.repositoryName}.deleteByJobName`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteByJobName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "deleteByJobName",
        message: `[Backup 작업 History 삭제(단일)] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * Backup 작업 History 삭제 ( By ID )
   */
  async deleteByJobId({ jobId, transaction }: { jobId: number; transaction: TransactionManager }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteByJobId", state: "start" })

      const result = await this.delete({
        data: { nID: jobId },
        transaction,
        request: `${this.repositoryName}.deleteByJobId`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteByJobId", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "deleteByJobId",
        message: `[Backup 작업 History 삭제(단일)] - 오류가 발생했습니다`,
      })
    }
  }
}