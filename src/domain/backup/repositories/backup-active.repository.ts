import { RepositoryConnectionTypeMap } from "../../../types/common/repository"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { BackupTypeMap } from "../types/backup-common.type"
import { BackupFilterOptions } from "../types/backup-filter.type"
import { BackupActiveTable } from "../types/db/active-backup"

export class BackupActiveRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "BackupActiveRepository",
      tableName: "active_backup",
    })
  }

  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions: BackupFilterOptions }): void {
    try {
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
      //  mode 필터 적용
      if (filterOptions.mode) {
        this.addCondition({ condition: "nBackupType = ?", params: [BackupTypeMap.fromString({ str: filterOptions.mode })] })
      }
      //  partition 필터 적용
      if (filterOptions.partition) {
        this.addCondition({ condition: "sDrive = ?", params: [filterOptions.partition] })
      }
      //  repositoryID 필터 적용
      if (filterOptions.repositoryID) {
        this.addCondition({ condition: "nRepositoryID = ?", params: [filterOptions.repositoryID] })
      }
      //  repositoryType 필터 적용
      if (filterOptions.repositoryType) {
        this.addCondition({
          condition: "nRepositoryType = ?",
          params: [RepositoryConnectionTypeMap.fromString({ str: filterOptions.repositoryType })],
        })
      }
      //  repositoryPath 필터 적용
      if (filterOptions.repositoryPath) {
        this.addCondition({ condition: "sRepositoryPath = ?", params: [filterOptions.repositoryPath] })
      }
      ContextLogger.debug({ message: `필터 옵션 적용됨` })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "end" })
    } catch (error) {
      this.handleRepositoryError({
        error,
        method: "applyFilters",
        message: "[Backup Info 조회 필터 옵션 적용] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 정보 가져오기
   */
  async findAll({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupActiveTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })
      this.resetQueryState()
      this.applyFilters({ filterOptions })
      let query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<BackupActiveTable[]>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[Backup Monitoring] - 오류가 발생했습니다",
      })
    }
  }
}
