import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { BackupFilterOptions } from "../types/backup-filter.type"
import { BackupTable } from "../types/db/job-backup"

export class BackupRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "BackupRepository",
      tableName: "job_backup",
    })
  }
  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions: BackupFilterOptions }): void {
    try {
      //  result 필터 적용
      if (filterOptions.result) {
        this.addCondition({ condition: "sJobResult = ?", params: [filterOptions.result] })
      }
      //  status 필터 적용
      if (filterOptions.status) {
        this.addCondition({ condition: "nJobStatus = ?", params: [filterOptions.status] })
      }
      ContextLogger.debug({ message: `필터 옵션 적용됨` })
    } catch (error) {
      this.handleRepositoryError({
        error,
        functionName: "applyFilters",
        message: "필터 옵션 적용 중 오류가 발생했습니다",
      })
    }
  }

  /**
   *  모든 Backup 작업 조회
   */
  async findAll({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      this.resetQueryState()
      this.applyFilters({ filterOptions })

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()

      return await this.executeQuery<BackupTable>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        functionName: "findAll",
        message: "Backup 작업 목록 조회 중 오류가 발생했습니다",
      })

    }
  }

  /**
   * 특정 작업 조회 ( by JobName )
   */
  async findByJobNames({ jobNames, filterOptions }: { jobNames: string[]; filterOptions: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      if (jobNames.length === 0) {
        return []
      }

      this.resetQueryState()
      this.applyFilters({ filterOptions })
      const placeholders = jobNames.map(() => "?").join(",")

      const query = `SELECT * FROM ${this.tableName} WHERE sJobName IN (${placeholders})`

      return await this.executeQuery<BackupTable>({ sql: query, params: jobNames, request: `${this.repositoryName}.findByJobNames`, })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        functionName: "findByJobNames",
        message: `Backup 작업 이름으로 조회 중 오류가 발생했습니다`,
      })
    }
  }
}
