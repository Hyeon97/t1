import { ResultSetHeader } from "mysql2/promise"
import { TransactionManager } from "../../../database/connection"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository, SqlFieldOption } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { BackupTableUpdateInput } from "../types/backup-edit.type"
import { BackupFilterOptions } from "../types/backup-get.type"
import { BackupTableInput } from "../types/backup-regist.type"
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
  private applyFilters({ filterOptions }: { filterOptions?: BackupFilterOptions }): void {
    try {
      if (!filterOptions) return
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
      //  result 필터 적용
      if (filterOptions.result) {
        this.addCondition({ condition: "sJobResult = ?", params: [filterOptions.result] })
      }
      //  status 필터 적용
      if (filterOptions.status) {
        this.addCondition({ condition: "nJobStatus = ?", params: [filterOptions.status] })
      }
      //  server name 필터 적용
      if (filterOptions.serverName) {
        this.addCondition({ condition: "sSystemName = ?", params: [filterOptions.serverName] })
      }
      //  job id 필터 적용
      if (filterOptions.jobId) {
        this.addCondition({ condition: "nID = ?", params: [filterOptions.jobId] })
      }
      //  job name 필터 적용
      if (filterOptions.jobName) {
        this.addCondition({ condition: "sJobName = ?", params: [filterOptions.jobName] })
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
   *  모든 Backup 작업 조회
   */
  async findAll({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })

      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<BackupTable[]>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[Backup 작업 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 특정 작업들 조회 ( by JobName )
   */
  async findByJobNames({ jobNames, filterOptions }: { jobNames: string[]; filterOptions?: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobNames", state: "start" })

      if (jobNames.length === 0) {
        return []
      }
      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const placeholders = jobNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sJobName IN (${placeholders})`
      const result = await this.executeQuery<BackupTable[]>({ sql: query, params: jobNames, request: `${this.repositoryName}.findByJobNames` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobNames", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobNames",
        message: `[Backup 작업 이름으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 작업 조회 ( by JobName Use Like )
   */
  async findByJobNameUseLike({ jobName, filterOptions }: { jobName: string; filterOptions: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobNameUseLike", state: "start" })

      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} WHERE sJobName LIKE '%${jobName}%'`
      const result = await this.executeQuery<BackupTable[]>({ sql: query, params: [jobName], request: `${this.repositoryName}.findByJobNameUseLike` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobNameUseLike", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobNameUseLike",
        message: `[Backup 작업 이름으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 작업 조회 ( by JobName )
   */
  async findByJobName({ jobName, filterOptions }: { jobName: string; filterOptions?: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobName", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "sJobName = ?", params: [jobName] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<BackupTable[]>({ sql: query, request: `${this.repositoryName}.findByJobName` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobName",
        message: `[Backup 작업 이름으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 작업 조회 ( by ID )
   */
  async findByJobId({ jobId, filterOptions }: { jobId: number; filterOptions?: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobId", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "nJobID = ?", params: [jobId] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<BackupTable[]>({ sql: query, request: `${this.repositoryName}.findByJobId` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobId", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobId",
        message: `[Backup 작업 ID로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 작업 조회 ( by server name )
   */
  async findByServerName({ serverName, filterOptions }: { serverName: string; filterOptions?: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByServerName", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "sSystemName = ?", params: [serverName] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()} ORDER BY sStartTime DESC`
      const result = await this.executeQuery<BackupTable[]>({ sql: query, request: `${this.repositoryName}.findByServerName` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByServerName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByServerName",
        message: `[Backup 작업 대상 Server Name으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * Backup 작업 정보 추가
   */
  async insertBackup({ backupData, transaction }: { backupData: BackupTableInput; transaction: TransactionManager }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "insertBackup", state: "start" })

      // 시간 필드에 대한 SQL 함수 사용 옵션 정의
      const sqlOptions: Record<string, SqlFieldOption> = {
        sStartTime: { raw: "now()" },
        sLastUpdateTime: { raw: "now()" },
      }
      const result = await this.insert({ data: backupData, options: sqlOptions, transaction, request: `${this.repositoryName}.insertBackup` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "insertBackup", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "insertBackup",
        message: "[Backup 작업 정보 추가] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * Backup 작업 정보 업데이트
   */
  async updateBackup({ id, backupData, transaction }: {
    id: number
    backupData: Partial<BackupTableUpdateInput>
    transaction: TransactionManager
  }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "updateBackup", state: "start" })

      // sLastUpdateTime 필드를 현재 시간으로 자동 설정
      const sqlOptions: Record<string, SqlFieldOption> = {
        sLastUpdateTime: { raw: 'now()' }
      }
      const result = await this.update({
        data: backupData,
        whereCondition: "nID = ?",
        whereParams: [id],
        options: sqlOptions,
        transaction,
        request: `${this.repositoryName}.updateBackup`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "updateBackup", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "updateBackup",
        message: `[Backup 작업 정보 업데이트] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * Backup 작업 삭제 ( By ID )
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
        message: `[Backup 작업 정보 삭제(단일)] - 오류가 발생했습니다`,
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
        message: `[Backup 작업 정보 삭제(단일)] - 오류가 발생했습니다`,
      })
    }
  }

  // /**
  //  * 여러 Backup 작업 삭제
  //  */
  // async deleteBackupByIds({ ids, transaction }: { ids: number[]; transaction: TransactionManager }): Promise<boolean> {
  //   try {
  //     asyncContextStorage.addRepository({ name: this.repositoryName })
  //     asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteBackupByIds", state: "start" })

  //     if (ids.length === 0) {
  //       return false
  //     }
  //     const placeholders = ids.map(() => "?").join(",")
  //     const result = await this.delete({
  //       whereCondition: `nID IN (${placeholders})`,
  //       whereParams: ids,
  //       transaction,
  //       request: `${this.repositoryName}.deleteBackupByIds`,
  //     })

  //     asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteBackupByIds", state: "end" })
  //     return result
  //   } catch (error) {
  //     return this.handleRepositoryError({
  //       error,
  //       method: "deleteBackupByIds",
  //       message: `[Backup 작업 삭제(다중중)] - 오류가 발생했습니다`,
  //     })
  //   }
  // }
}
