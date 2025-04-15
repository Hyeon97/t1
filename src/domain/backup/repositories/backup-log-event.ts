import { ResultSetHeader } from "mysql2"
import { TransactionManager } from "../../../database/connection"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { BackupLogEventTable } from "../types/db/log-event-backup"

export class BackupLogRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "BackupLogRepository",
      tableName: "log_event_backup",
    })
  }

  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions: any }): void {
    try {
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
      //  result 필터 적용
      if (filterOptions.result) {
        this.addCondition({ condition: "sJobResult = ?", params: [filterOptions.result] })
      }
      //  status 필터 적용
      if (filterOptions.status) {
        this.addCondition({ condition: "nJobStatus = ?", params: [filterOptions.status] })
      }
      ContextLogger.debug({ message: `필터 옵션 적용됨` })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "end" })
    } catch (error) {
      this.handleRepositoryError({
        error,
        method: "applyFilters",
        message: "[필터 옵션 적용] - 오류가 발생했습니다",
      })
    }
  }

  /**
   *  모든 Backup Log 조회
   */
  async findAll({ filterOptions }: { filterOptions: any }): Promise<BackupLogEventTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })

      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<BackupLogEventTable[]>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[Backup Log 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * Backup 작업 삭제 ( by jobName )
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
        message: `[Backup 작업 Log 삭제(단일)] - 오류가 발생했습니다`,
      })
    }
  }

}