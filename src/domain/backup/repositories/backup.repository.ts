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
      this.applyFilters(filterOptions)

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      logger.debug(`실행 쿼리: ${query}, 파라미터: ${this.params.join(", ")}`)
      return await executeQuery<BackupTable>({ sql: query, params: this.params })
    } catch (error: any) {
      logger.debug("Backup 정보 조회 중 BackupRepository.findAll() 오류 발생")
      throw BackupError.databaseError({
        message: "Backup 조회 중 오류 발생",
        logMessage: ["Backup 정보 조회 중 BackupRepository.findAll() 오류 발생", error.message],
      })
    }
  }

  /**
   * 특정 작업 이름을 가진 정보 조회
   */
  async findByJobNames({ jobNames, filterOptions }: { jobNames: string[]; filterOptions: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      if (jobNames.length === 0) {
        return []
      }
      this.resetQueryState()
      this.applyFilters(filterOptions)
      const placeholders = jobNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sJobName IN (${placeholders})`
      logger.debug(`Backup 정보 조회 쿼리: ${query}, 파라미터: ${jobNames.join(", ")}`)
      return await executeQuery<BackupTable>({ sql: query, params: jobNames })
    } catch (error: any) {
      logger.debug("Backup 정보 조회 중 BackupRepository.findByJobNames() 오류 발생")
      throw BackupError.databaseError({
        message: "Backup 정보 조회 중 오류 발생",
        logMessage: ["Backup 정보 조회 중 BackupRepository.findByJobNames() 오류 발생", error.message],
      })
    }
  }
}
