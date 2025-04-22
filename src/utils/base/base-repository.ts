import { ResultSetHeader } from "mysql2/promise"
import { DatabaseOperations, TransactionManager } from "../../database/connection"
import { DatabaseError } from "../../errors"
import { RepositoryError } from "../../errors/repository/repository-error"
import { ContextLogger } from "../logger/logger.custom"

/**
 * SQL 필드 타입 정의
 */
export type SqlFieldValue = string | number | boolean | null | undefined | Date

/**
 * SQL 필드 옵션 타입 정의
 */
export interface SqlFieldOption {
  raw?: string // SQL 함수나 표현식을 직접 사용할 때
  exclude?: boolean // SQL 생성에서 제외할 필드
}

/**
 * SQL 생성을 위한 유틸리티 클래스
 */
export class SqlBuilder {
  private fields: Map<string, SqlFieldValue> = new Map()
  private rawFields: Map<string, string> = new Map()
  private excludedFields: Set<string> = new Set()

  /**
   * 데이터 객체와 옵션으로 SQL 빌더 초기화
   */
  constructor(data?: Record<string, any>, options?: Record<string, SqlFieldOption>) {
    if (data) {
      this.addData(data, options)
    }
  }

  /**
   * 데이터 객체 추가
   */
  addData(data: Record<string, any>, options?: Record<string, SqlFieldOption>): this {
    Object.entries(data).forEach(([key, value]) => {
      // 필드 옵션 확인
      const fieldOption = options?.[key]

      // 제외 필드 처리
      if (fieldOption?.exclude) {
        this.excludedFields.add(key)
        return
      }

      // Raw SQL 필드 처리
      if (fieldOption?.raw) {
        this.addRawField(key, fieldOption.raw)
        return
      }

      // 일반 필드 처리
      this.addField(key, value)
    })

    return this
  }

  /**
   * 일반 필드 추가
   */
  addField(name: string, value: SqlFieldValue): this {
    this.fields.set(name, value)
    return this
  }

  /**
   * Raw SQL 필드 추가
   */
  addRawField(name: string, rawSql: string): this {
    this.rawFields.set(name, rawSql)
    return this
  }

  /**
   * INSERT 쿼리 생성
   */
  buildInsert(tableName: string): { sql: string; params: any[] } {
    const fieldParts: string[] = []
    const params: any[] = []

    // 일반 필드 처리
    this.fields.forEach((value, name) => {
      if (!this.excludedFields.has(name) && value !== undefined) {
        fieldParts.push(`\`${name}\` = ?`)
        params.push(value)
      }
    })

    // Raw SQL 필드 처리
    this.rawFields.forEach((rawSql, name) => {
      if (!this.excludedFields.has(name)) {
        fieldParts.push(`\`${name}\` = ${rawSql}`)
      }
    })

    return {
      sql: `INSERT INTO ${tableName} SET ${fieldParts.join(", ")}`,
      params,
    }
  }

  /**
   * Delete 쿼리 생성
   */
  buildDelete(tableName: string): { sql: string; params: any[] } {
    const fieldParts: string[] = []
    const params: any[] = []

    // 일반 필드 처리
    this.fields.forEach((value, name) => {
      if (!this.excludedFields.has(name) && value !== undefined) {
        fieldParts.push(`${name} = ?`)
        params.push(value)
      }
    })

    // Raw SQL 필드 처리
    this.rawFields.forEach((rawSql, name) => {
      if (!this.excludedFields.has(name)) {
        fieldParts.push(`${name} = ${rawSql}`)
      }
    })

    return {
      sql: `DELETE FROM ${tableName} WHERE ${fieldParts.join(", ")}`,
      params,
    }
  }

  /**
   * UPDATE 쿼리 생성
   */
  buildUpdate(tableName: string, whereCondition: string, whereParams: any[] = []): { sql: string; params: any[] } {
    const { sql: setClauseSql, params: setParams } = this.buildSetClause()

    return {
      sql: `UPDATE ${tableName} SET ${setClauseSql} WHERE ${whereCondition}`,
      params: [...setParams, ...whereParams],
    }
  }

  /**
   * SET 절 생성
   */
  private buildSetClause(): { sql: string; params: any[] } {
    const fieldParts: string[] = []
    const params: any[] = []

    // 일반 필드 처리
    this.fields.forEach((value, name) => {
      if (!this.excludedFields.has(name) && value !== undefined) {
        fieldParts.push(`\`${name}\` = ?`)
        params.push(value)
      }
    })

    // Raw SQL 필드 처리
    this.rawFields.forEach((rawSql, name) => {
      if (!this.excludedFields.has(name)) {
        fieldParts.push(`\`${name}\` = ${rawSql}`)
      }
    })

    return {
      sql: fieldParts.join(", "),
      params,
    }
  }
}

export class BaseRepository {
  protected readonly repositoryName: string
  protected readonly tableName: string
  protected query: string = ""
  protected params: any[] = []
  protected conditions: string[] = []

  constructor({ repositoryName, tableName }: { repositoryName: string; tableName: string }) {
    this.repositoryName = repositoryName //  repository 이름
    this.tableName = tableName //  repository에서 사용하는 table 이름
  }

  /**
   * 쿼리 상태 초기화
   */
  protected resetQueryState(): void {
    this.query = ""
    this.params = []
    this.conditions = []
  }

  /**
   * WHERE 절에 조건 추가
   */
  protected addCondition({ condition, params }: { condition: string; params: any[] }): void {
    this.conditions.push(condition)
    this.params.push(...params)
  }

  /**
   * WHERE 절에 원시 조건 추가 (파라미터 없음)
   */
  protected addRawCondition({ condition }: { condition: string }): void {
    this.conditions.push(condition)
  }

  /**
   * WHERE 절 생성
   */
  protected buildWhereClause(): string {
    if (this.conditions.length === 0) {
      return ""
    }
    return ` WHERE ${this.conditions.join(" AND ")}`
  }

  /**
   * SQL 빌더 가져오기
   */
  protected getSqlBuilder({ data, options }: { data: Record<string, any>; options?: Record<string, SqlFieldOption> }): SqlBuilder {
    return new SqlBuilder(data, options)
  }

  /**
   * 데이터베이스 쿼리 실행
   */
  protected async executeQuery<T>({ sql, params = [], request }: { sql: string; params?: any[]; request: string }): Promise<T> {
    try {
      if (!params.length) params = this.params
      return await DatabaseOperations.executeQuery<T>({ sql, params, request })
    } catch (error) {
      // if (error instanceof DatabaseError) {throw RepositoryError.fromDatabaseError({ error, method }) }
      // throw RepositoryError.fromError({ error, method })
      //  순수 DB 관련 에러만 리턴
      throw error
    }
  }

  /**
   * 데이터베이스 단일 레코드 쿼리 실행
   */
  protected async executeQuerySingle<T>({ sql, params = [], request }: { sql: string; params?: any[]; request: string }): Promise<T | null> {
    try {
      return await DatabaseOperations.executeQuerySingle<T>({ sql, params, request })
    } catch (error) {
      // if (error instanceof DatabaseError) {throw RepositoryError.fromDatabaseError({ error, method }) }
      // if (error instanceof RepositoryError) {throw error }
      // throw RepositoryError.fromError({ error, method })
      //  순수 DB 관련 에러만 리턴
      throw error
    }
  }

  /**
   * 일반적인 INSERT 쿼리 실행
   */
  protected async insert<T extends Record<string, any>>({
    data,
    options,
    transaction,
    request,
  }: {
    data: T
    options?: Record<string, SqlFieldOption>
    transaction: TransactionManager
    request: string
  }): Promise<ResultSetHeader> {
    try {
      // SQL 빌더로 쿼리 생성
      const sqlBuilder = this.getSqlBuilder({ data, options })
      const { sql, params } = sqlBuilder.buildInsert(this.tableName)

      // 트랜잭션 내에서 또는 일반 쿼리로 실행
      const result = await transaction.executeQuery<ResultSetHeader>({
        sql,
        params,
        request,
      })

      return result
    } catch (error) {
      const method = request.split(".").pop() || "insert"
      return this.handleRepositoryError({
        error,
        method,
        message: `${this.repositoryName} 데이터 추가 중 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 일반적인 UPDATE 쿼리 실행
   */
  protected async update<T extends Record<string, any>>({
    data,
    whereCondition,
    whereParams,
    options,
    transaction,
    request,
  }: {
    data: T
    whereCondition: string
    whereParams: any[]
    options?: Record<string, SqlFieldOption>
    transaction: TransactionManager
    request: string
  }): Promise<ResultSetHeader> {
    try {
      // SQL 빌더로 쿼리 생성
      const sqlBuilder = this.getSqlBuilder({ data, options })
      const { sql, params } = sqlBuilder.buildUpdate(this.tableName, whereCondition, whereParams)

      // 트랜잭션 내에서 또는 일반 쿼리로 실행
      const result = await transaction.executeQuery<ResultSetHeader>({
        sql,
        params,
        request,
      })

      return result
    } catch (error) {
      const method = request.split(".").pop() || "update"
      return this.handleRepositoryError({
        error,
        method,
        message: `${this.repositoryName} 데이터 업데이트 중 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 일반적인 DELETE 쿼리 실행
   */
  // protected async delete({
  //   whereCondition,
  //   whereParams,
  //   transaction,
  //   request,
  // }: {
  //   whereCondition: string
  //   whereParams: any[]
  //   transaction: TransactionManager
  //   request: string
  // }): Promise<boolean> {
  //   try {
  //     const sql = `DELETE FROM ${this.tableName} WHERE ${whereCondition}`

  //     // 트랜잭션 내에서 또는 일반 쿼리로 실행
  //     const result = await transaction.executeQuery<ResultSetHeader>({
  //       sql,
  //       params: whereParams,
  //       request,
  //     })

  //     return (result?.affectedRows || 0) > 0
  //   } catch (error) {
  //     const method = request.split(".").pop() || "delete"
  //     return this.handleRepositoryError({
  //       error,
  //       method,
  //       message: `${this.repositoryName} 데이터 삭제 중 오류가 발생했습니다`,
  //     })
  //   }
  // }
  protected async delete<T extends Record<string, any>>({
    data,
    options,
    transaction,
    request,
  }: {
    data: T
    options?: Record<string, SqlFieldOption>
    transaction: TransactionManager
    request: string
  }): Promise<ResultSetHeader> {
    try {
      // const sql = `DELETE FROM ${this.tableName} WHERE ${whereCondition}`
      const sqlBuilder = this.getSqlBuilder({ data, options })
      const { sql, params } = sqlBuilder.buildDelete(this.tableName)

      // 트랜잭션 내에서 또는 일반 쿼리로 실행
      const result = await transaction.executeQuery<ResultSetHeader>({
        sql,
        params,
        request,
      })

      return result
    } catch (error) {
      const method = request.split(".").pop() || "delete"
      return this.handleRepositoryError({
        error,
        method,
        message: `${this.repositoryName} 데이터 삭제 중 오류가 발생했습니다`,
      })
    }
  }

  /**
   * Repository 에러 처리
   */
  protected handleRepositoryError({ error, method, message }: { error: unknown; method: string; message: string }): never {
    const application = this.repositoryName
    // Database Layer에서 발생한 에러 처리
    if (error instanceof DatabaseError) {
      throw RepositoryError.fromDatabaseError({ error, method })
    }
    //  Repository Layer에서 발생한 에러만 로깅
    else if (error instanceof Error && error instanceof RepositoryError) {
      //  에러가 발생한 Repository Layer Application이름 주입
      if (error?.metadata) {
        error.metadata.application = application
      }
      //  로깅
      ContextLogger.debug({
        message: `[Repository-Layer] ${this.repositoryName}.${method}() 오류 발생`,
        meta: { error: error instanceof Error ? error.message : String(error) },
      })
      //  Repository Layer에서 발생한 정의되지 않은 오류 처리
    } else if (error instanceof Error && !(error instanceof RepositoryError)) {
      error = RepositoryError.fromError<RepositoryError>(error, { method, message, error, application })
    }
    throw error
  }
}
