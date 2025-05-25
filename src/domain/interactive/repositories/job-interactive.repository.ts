import { ResultSetHeader } from "mysql2/promise"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository, SqlFieldOption } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { JobInteractiveTable } from "../types/db/job_interactive"
import { JobInteractiveFilterOptions, JobInteractiveLicenseVerificationInput } from "../types/interactive"
import { TransactionManager } from "../../../database/connection"

export class JobInteractiveRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "JobInteractiveRepository",
      tableName: "job_interactive",
    })
  }

  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions?: JobInteractiveFilterOptions }): void {
    try {
      if (!filterOptions) return
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })

      // centerID 필터 적용
      if (filterOptions.centerID) {
        this.addCondition({ condition: "nCenterID = ?", params: [filterOptions.centerID] })
      }

      // systemName 필터 적용
      if (filterOptions.systemName) {
        this.addCondition({ condition: "sSystemName = ?", params: [filterOptions.systemName] })
      }

      // requestID 필터 적용
      if (filterOptions.requestID) {
        this.addCondition({ condition: "nRequestID = ?", params: [filterOptions.requestID] })
      }

      // jobType 필터 적용
      if (filterOptions.jobType) {
        this.addCondition({ condition: "nJobType = ?", params: [filterOptions.jobType] })
      }

      // jobStatus 필터 적용
      if (filterOptions.jobStatus) {
        this.addCondition({ condition: "nJobStatus = ?", params: [filterOptions.jobStatus] })
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
   * 모든 JobInteractive 정보 조회
   */
  async findAll({ filterOptions }: { filterOptions?: JobInteractiveFilterOptions } = {}): Promise<JobInteractiveTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })

      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<JobInteractiveTable[]>({
        sql: query,
        params: this.params,
        request: `${this.repositoryName}.findAll`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[JobInteractive 정보 조회] - JobInteractive 정보 조회 중 에러 발생",
      })
    }
  }

  /**
   * JobInteractive ID로 조회
   */
  async findById({ id, filterOptions }: { id: number; filterOptions?: JobInteractiveFilterOptions }): Promise<JobInteractiveTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findById", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "nID = ?", params: [id] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuerySingle<JobInteractiveTable>({
        sql: query,
        params: this.params,
        request: `${this.repositoryName}.findById`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findById", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findById",
        message: "[JobInteractive ID로 정보 조회] - JobInteractive 정보 조회 중 에러 발생",
      })
    }
  }

  /**
   * Center ID로 조회
   */
  async findByCenterID({
    centerID,
    filterOptions,
  }: {
    centerID: number
    filterOptions?: JobInteractiveFilterOptions
  }): Promise<JobInteractiveTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByCenterID", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "nCenterID = ?", params: [centerID] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<JobInteractiveTable[]>({
        sql: query,
        params: this.params,
        request: `${this.repositoryName}.findByCenterID`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByCenterID", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByCenterID",
        message: "[Center ID로 정보 조회] - JobInteractive 정보 조회 중 에러 발생",
      })
    }
  }

  /**
   * System Name으로 조회
   */
  async findBySystemName({
    systemName,
    filterOptions,
  }: {
    systemName: string
    filterOptions?: JobInteractiveFilterOptions
  }): Promise<JobInteractiveTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemName", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "sSystemName = ?", params: [systemName] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<JobInteractiveTable[]>({
        sql: query,
        params: this.params,
        request: `${this.repositoryName}.findBySystemName`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findBySystemName",
        message: "[System Name으로 정보 조회] - JobInteractive 정보 조회 중 에러 발생",
      })
    }
  }

  /**
   * Request ID로 조회
   */
  async findByRequestID({
    requestID,
    filterOptions,
  }: {
    requestID: number
    filterOptions?: JobInteractiveFilterOptions
  }): Promise<JobInteractiveTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByRequestID", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "nRequestID = ?", params: [requestID] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuerySingle<JobInteractiveTable>({
        sql: query,
        params: this.params,
        request: `${this.repositoryName}.findByRequestID`,
      })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByRequestID", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByRequestID",
        message: "[Request ID로 정보 조회] - JobInteractive 정보 조회 중 에러 발생",
      })
    }
  }

  /**
   * 데이터 등록 Transaction 미사용
   */
  async insertDataWithOutTransaction({ data }: { data: JobInteractiveLicenseVerificationInput }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "create", state: "start" })

      // 시간 필드에 대한 SQL 함수 사용 옵션 정의
      const sqlOptions: Record<string, SqlFieldOption> = {
        sLastUpdateTime: { raw: "now()" },
      }
      const sqlBuilder = this.getSqlBuilder({ data, options: sqlOptions })
      const { sql, params } = sqlBuilder.buildInsert(this.tableName)
      const result = await this.executeQuery<ResultSetHeader>({ sql, params, request: `${this.repositoryName}.insertData` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "create", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "create",
        message: "[JobInteractive Data 등록] - JobInteractive Data 등록 중 에러 발생",
      })
    }
  }

  /**
   * 데이터 등록 Transaction 사용
   */
  async insertDataWithTransaction({
    data,
    transaction,
  }: {
    data: JobInteractiveLicenseVerificationInput
    transaction: TransactionManager
  }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "create", state: "start" })

      // 시간 필드에 대한 SQL 함수 사용 옵션 정의
      const sqlOptions: Record<string, SqlFieldOption> = {
        sLastUpdateTime: { raw: "now()" },
      }
      const result = await this.insert({ data, options: sqlOptions, transaction, request: `${this.repositoryName}.insertData` })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "create", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "create",
        message: "[JobInteractive Data 등록] - JobInteractive Data 등록 중 에러 발생",
      })
    }
  }

  // /**
  //  * License 검증 상태 등록 및 결과 대기
  //  */
  // async createLicenseVerificationAndWait({
  //   data,
  //   timeout = 5000,
  //   interval = 1000,
  // }: {
  //   data: CreateJobInteractiveLicenseVerificationData
  //   timeout?: number
  //   interval?: number
  // }): Promise<boolean> {
  //   try {
  //     asyncContextStorage.addRepository({ name: this.repositoryName })
  //     asyncContextStorage.addOrder({ component: this.repositoryName, method: "createLicenseVerificationAndWait", state: "start" })

  //     // 1. JobInteractive 등록
  //     const insertQuery = `INSERT INTO ${this.tableName}
  //       (nGroupID, nUserID, nCenterID, nRequestID, sSystemName, nJobType, nJobStatus, sJobData)
  //       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`

  //     const insertParams = [
  //       data.nGroupID,
  //       data.nUserID,
  //       data.nCenterID,
  //       data.nRequestID,
  //       data.sSystemName,
  //       data.nJobType,
  //       data.nJobStatus,
  //       data.sJobData,
  //     ]

  //     await this.executeQuery<ResultSetHeader>({
  //       sql: insertQuery,
  //       params: insertParams,
  //       request: `${this.repositoryName}.createLicenseVerificationAndWait.insert`,
  //     })

  //     // 2. 결과 대기 및 확인
  //     const checkQuery = `SELECT sJobResult FROM ${this.tableName} WHERE nRequestID = ?`
  //     const isSuccess = await new Promise<boolean>((resolve, reject) => {
  //       const start = Date.now()
  //       const checkInterval = setInterval(async () => {
  //         try {
  //           if (Date.now() - start >= timeout) {
  //             clearInterval(checkInterval)
  //             reject(new Error("Operation timed out: Status did not change to SUCCESS"))
  //             return
  //           }

  //           const result = await this.executeQuery<JobInteractiveTable[]>({
  //             sql: checkQuery,
  //             params: [data.nRequestID],
  //             request: `${this.repositoryName}.createLicenseVerificationAndWait.check`,
  //           })

  //           const row = result[0]
  //           if (row?.sJobResult === "SUCCESS") {
  //             clearInterval(checkInterval)
  //             resolve(true)
  //           }
  //         } catch (error: any) {
  //           clearInterval(checkInterval)
  //           reject(new Error(`Error during status check: ${error.message}`))
  //         }
  //       }, interval)
  //     })

  //     asyncContextStorage.addOrder({ component: this.repositoryName, method: "createLicenseVerificationAndWait", state: "end" })
  //     return isSuccess
  //   } catch (error) {
  //     return this.handleRepositoryError({
  //       error,
  //       method: "createLicenseVerificationAndWait",
  //       message: "[License 검증 상태 등록 및 대기] - 처리 중 에러 발생",
  //     })
  //   }
  // }
}
