import { RepositoryConnectionTypeMap } from "../../../types/common/repository"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { BackupTypeMap } from "../types/backup-common.type"
import { BackupMonitoringFilterOptions } from "../types/backup-monitoring.type"
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
  // private applyFilters({ filterOptions }: { filterOptions: BackupMonitoringFilterOptions }): void {
  //   try {
  //     asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
  //     //  mode 필터 적용
  //     if (filterOptions.mode) {
  //       this.addCondition({ condition: "nBackupType = ?", params: [BackupTypeMap.fromString({ str: filterOptions.mode })] })
  //     }
  //     //  partition 필터 적용
  //     if (filterOptions.partition) {
  //       this.addCondition({ condition: "sDrive = ?", params: [filterOptions.partition] })
  //     }
  //     //  repositoryID 필터 적용
  //     if (filterOptions.repositoryID) {
  //       this.addCondition({ condition: "nRepositoryID = ?", params: [filterOptions.repositoryID] })
  //     }
  //     //  repositoryType 필터 적용
  //     if (filterOptions.repositoryType) {
  //       this.addCondition({
  //         condition: "nRepositoryType = ?",
  //         params: [RepositoryConnectionTypeMap.fromString({ str: filterOptions.repositoryType })],
  //       })
  //     }
  //     //  repositoryPath 필터 적용
  //     if (filterOptions.repositoryPath) {
  //       this.addCondition({ condition: "sRepositoryPath = ?", params: [filterOptions.repositoryPath] })
  //     }
  //     ContextLogger.debug({ message: `필터 옵션 적용됨` })
  //     asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "end" })
  //   } catch (error) {
  //     this.handleRepositoryError({
  //       error,
  //       method: "applyFilters",
  //       message: "[Backup Active Data 조회 필터 옵션 적용] - 오류가 발생했습니다",
  //     })
  //   }
  // }

  /**
   * Backup active 정보 가져오기 ( by jobName )
   */
  async findByJobName({ jobName, filterOptions }: { jobName: string; filterOptions: BackupMonitoringFilterOptions }): Promise<BackupActiveTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobName", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "sJobName = ?", params: [jobName] })
      // this.applyFilters({ filterOptions })

      let query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()} ORDER BY sStartTime DESC`
      const result = await this.executeQuery<BackupActiveTable[]>({
        sql: query,
        params: this.params,
        request: `${this.repositoryName}.findByJobName`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobName",
        message: "[Backup Active Data 작업 이름으로 조회] - 오류가 발생했습니다",
      })
    }
  }
}
