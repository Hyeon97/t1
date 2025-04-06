export class BackupInfoRepository extends CommonRepository {
  protected readonly tableName = "job_backup_info"

  /**
   * 필터 옵션 적용
   */
  private applyFilters(filterOptions: BackupFilterOptions): void {
    //  mode 필터 적용
    if (filterOptions.mode) {
      this.addCondition({ condition: "nBackupType = ?", params: [BackupTypeMap.fromString[filterOptions.mode]] })
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
        params: [RepositoryConnectionTypeMap.fromString(filterOptions.repositoryType)],
      })
    }
    //  repositoryPath 필터 적용
    if (filterOptions.repositoryPath) {
      this.addCondition({ condition: "sRepositoryPath = ?", params: [filterOptions.repositoryPath] })
    }
  }

  /**
   *  모든 Backup 작업 info 조회
   */
  async findAll({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupInfoTable[]> {
    try {
      this.resetQueryState()
      this.applyFilters(filterOptions)

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      logger.debug(`실행 쿼리: ${query}, 파라미터: ${this.params.join(", ")}`)
      return await executeQuery<BackupInfoTable>({ sql: query, params: this.params })
    } catch (error) {
      throw ApiError.databaseError({ message: "Backup Info 목록을 조회하는 중에 오류 발생했습니다" })
    }
  }

  /**
   * 특정 작업 이름을 가진 정보 조회
   */
  async findByJobNames({ jobNames, filterOptions }: { jobNames: string[]; filterOptions: BackupFilterOptions }): Promise<BackupInfoTable[]> {
    try {
      if (jobNames.length === 0) {
        return []
      }
      this.resetQueryState()
      this.applyFilters(filterOptions)
      const placeholders = jobNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sJobName IN (${placeholders})`
      logger.debug(`Backup Info 정보 조회 쿼리: ${query}, 파라미터: ${jobNames.join(", ")}`)
      return await executeQuery<BackupInfoTable>({ sql: query, params: jobNames })
    } catch (error) {
      throw ApiError.databaseError({ message: "Backup Info 목록을 조회하는 중에 오류 발생했습니다" })
    }
  }
}
