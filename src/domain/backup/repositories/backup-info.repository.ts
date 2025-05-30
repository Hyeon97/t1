import { ResultSetHeader } from "mysql2/promise"
import { TransactionManager } from "../../../database/connection"
import { RepositoryConnectionTypeMap } from "../../../types/common/repository"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository, SqlFieldOption } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { BackupTypeMap } from "../types/backup-common.type"
import { BackupTableInfoUpdateInput } from "../types/backup-edit.type"
import { BackupFilterOptions } from "../types/backup-get.type"
import { BackupInfoTableInput } from "../types/backup-regist.type"
import { BackupInfoTable } from "../types/db/job-backup-info"

export class BackupInfoRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "BackupInfoRepository",
      tableName: "job_backup_info",
    })
  }

  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions?: BackupFilterOptions }): void {
    try {
      if (!filterOptions) return
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
   *  모든 Backup 작업 info 조회
   */
  async findAll({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupInfoTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })
      this.resetQueryState()
      this.applyFilters({ filterOptions })
      let query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<BackupInfoTable[]>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[Backup Info 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 특정 작업 이름을 가진 정보 조회
   */
  async findByJobNames({ jobNames, filterOptions }: { jobNames: string[]; filterOptions: BackupFilterOptions }): Promise<BackupInfoTable[]> {
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
      const result = await this.executeQuery<BackupInfoTable[]>({ sql: query, params: jobNames, request: `${this.repositoryName}.findByJobNames` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobNames", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobNames",
        message: "[Backup Info 작업 이름으로 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 특정 작업 조회 ( by JobName )
   */
  async findByJobName({ jobName, filterOptions }: { jobName: string; filterOptions?: BackupFilterOptions }): Promise<BackupInfoTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobName", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "sJobName = ?", params: [jobName] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName}`
      const result = await this.executeQuery<BackupInfoTable[]>({ sql: query, request: `${this.repositoryName}.findByJobName` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobName",
        message: `[Backup Info 작업 이름으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 작업 조회 ( by JobId )
   */
  async findByJobId({ jobId, filterOptions }: { jobId: number; filterOptions?: BackupFilterOptions }): Promise<BackupInfoTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobId", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "nID = ?", params: [jobId] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName}`
      const result = await this.executeQuery<BackupInfoTable[]>({ sql: query, request: `${this.repositoryName}.findByJobId` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByJobId", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobId",
        message: `[Backup Info 작업 ID로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 작업 조회 ( by server name )
   */
  async findByServerName({ serverName, filterOptions }: { serverName: string; filterOptions?: BackupFilterOptions }): Promise<BackupInfoTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByServerName", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "sSystemName = ?", params: [serverName] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<BackupInfoTable[]>({ sql: query, request: `${this.repositoryName}.findByServerName` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByServerName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByServerName",
        message: `[Backup Info 작업 대상 Server Name으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * Backup info 작업 정보 추가
   */
  async insertBackupInfo({
    backupInfoData,
    transaction,
  }: {
    backupInfoData: BackupInfoTableInput
    transaction: TransactionManager
  }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "insertBackupInfo", state: "start" })
      // 시간 필드에 대한 SQL 함수 사용 옵션 정의
      const sqlOptions: Record<string, SqlFieldOption> = {}
      const result = await this.insert({
        data: backupInfoData,
        options: sqlOptions,
        transaction,
        request: `${this.repositoryName}.insertBackupInfo`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "insertBackupInfo", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "insertBackupInfo",
        message: "[Backup Info 정보 추가] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * Backup info 작업 업데이트
   */
  async updateBackupInfo({ id, backupInfoData, transaction }: {
    id: number
    backupInfoData: Partial<BackupTableInfoUpdateInput>
    transaction: TransactionManager
  }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "updateBackupInfo", state: "start" })

      // sLastUpdateTime 필드를 현재 시간으로 자동 설정
      const sqlOptions: Record<string, SqlFieldOption> = {
        // sLastUpdateTime: { raw: 'now()' }
      }
      const result = await this.update({
        data: backupInfoData,
        whereCondition: "nID = ?",
        whereParams: [id],
        options: sqlOptions,
        transaction,
        request: `${this.repositoryName}.updateBackupInfo`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "updateBackupInfo", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "updateBackupInfo",
        message: `[Backup 작업 정보 업데이트] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * Backup info 작업 삭제 ( by jobName )
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
        message: `[Backup Info 작업 정보 삭제(단일)] - 오류가 발생했습니다`,
      })
    }
  }

  /**
 * Backup info 작업 삭제 ( by jobID )
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
        message: `[Backup Info 작업 정보 삭제(단일)] - 오류가 발생했습니다`,
      })
    }
  }
}
