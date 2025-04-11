import { ResultSetHeader } from "mysql2/promise"
import { TransactionManager } from "../../../database/connection"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository, SqlFieldOption } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { BackupFilterOptions } from "../types/backup-filter.type"
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
  private applyFilters({ filterOptions }: { filterOptions: BackupFilterOptions }): void {
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
   *  모든 Backup 작업 조회
   */
  async findAll({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })

      this.resetQueryState()
      this.applyFilters({ filterOptions })

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
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
   * 특정 작업 조회 ( by JobName )
   */
  async findByJobNames({ jobNames, filterOptions }: { jobNames: string[]; filterOptions: BackupFilterOptions }): Promise<BackupTable[]> {
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
        message: "[Backup 정보 추가] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * Backup 작업 정보 업데이트
   */
  async updateBackup({
    id,
    backupData,
    transaction,
  }: {
    id: number
    backupData: Partial<BackupTableInput>
    transaction: TransactionManager
  }): Promise<boolean> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "updateBackup", state: "start" })

      // sLastUpdateTime 필드를 현재 시간으로 자동 설정
      const sqlOptions: Record<string, SqlFieldOption> = {
        // sLastUpdateTime: { raw: 'now()' }
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
   * Backup 작업 삭제
   */
  async deleteBackup({ id, transaction }: { id: number; transaction: TransactionManager }): Promise<boolean> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteBackup", state: "start" })

      const result = await this.delete({
        whereCondition: "nID = ?",
        whereParams: [id],
        transaction,
        request: `${this.repositoryName}.deleteBackup`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteBackup", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "deleteBackup",
        message: `[Backup 작업 삭제(단일)] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 여러 Backup 작업 삭제
   */
  async deleteBackupByIds({ ids, transaction }: { ids: number[]; transaction: TransactionManager }): Promise<boolean> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteBackupByIds", state: "start" })

      if (ids.length === 0) {
        return false
      }
      const placeholders = ids.map(() => "?").join(",")
      const result = await this.delete({
        whereCondition: `nID IN (${placeholders})`,
        whereParams: ids,
        transaction,
        request: `${this.repositoryName}.deleteBackupByIds`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "deleteBackupByIds", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "deleteBackupByIds",
        message: `[Backup 작업 삭제(다중중)] - 오류가 발생했습니다`,
      })
    }
  }
}
