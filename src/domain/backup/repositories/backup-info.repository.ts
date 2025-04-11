import { ResultSetHeader } from "mysql2/promise"
import { TransactionManager } from "../../../database/connection"
import { RepositoryConnectionTypeMap } from "../../../types/common/repository"
import { BaseRepository, SqlFieldOption } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { BackupTypeMap } from "../types/backup-common.type"
import { BackupFilterOptions } from "../types/backup-filter.type"
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
  private applyFilters({ filterOptions }: { filterOptions: BackupFilterOptions }): void {
    try {
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
    } catch (error) {
      this.handleRepositoryError({
        error,
        method: "applyFilters",
        message: "필터 옵션 적용 중 오류가 발생했습니다",
      })
    }
  }

  /**
   *  모든 Backup 작업 info 조회
   */
  async findAll({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupInfoTable[]> {
    try {
      this.resetQueryState()
      this.applyFilters({ filterOptions })

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()

      return await this.executeQuery<BackupInfoTable[]>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "Backup Info 조회 중 오류가 발생했습니다",
      })
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
      this.applyFilters({ filterOptions })
      const placeholders = jobNames.map(() => "?").join(",")

      const query = `SELECT * FROM ${this.tableName} WHERE sJobName IN (${placeholders})`
      return await this.executeQuery<BackupInfoTable[]>({ sql: query, params: jobNames, request: `${this.repositoryName}.findByJobNames`, })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByJobNames",
        message: "Backup Info 조회 중 오류가 발생했습니다",
      })
    }
  }

  /**
   * Backup info 작업 정보 추가
   */
  async insertBackupInfo({ backupInfoData, transaction }: { backupInfoData: BackupInfoTableInput, transaction: TransactionManager }): Promise<ResultSetHeader> {
    try {
      // 시간 필드에 대한 SQL 함수 사용 옵션 정의
      const sqlOptions: Record<string, SqlFieldOption> = {}

      return await this.insert({
        data: backupInfoData,
        options: sqlOptions,
        transaction,
        request: `${this.repositoryName}.insertBackupInfo`
      })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "insertBackupInfo",
        message: "Backup 상세 정보 추가 중 오류가 발생했습니다"
      })
    }
  }
}
