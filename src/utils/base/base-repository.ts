import { DatabaseOperations } from "../../database/connection"
import { DatabaseError } from "../../errors/database/database-error"
import { RepositoryError } from "../../errors/repository/repository-error"
import { ContextLogger } from "../logger/logger.custom"

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
   * 데이터베이스 쿼리 실행
   */
  protected async executeQuery<T>({ sql, params = [], request }: { sql: string; params?: any[]; request: string }): Promise<T[]> {
    try {
      return await DatabaseOperations.executeQuery<T>({ sql, params, request })
    } catch (error) {
      // if (error instanceof DatabaseError) {throw RepositoryError.fromDatabaseError({ error, functionName }) }
      // throw RepositoryError.fromError({ error, functionName })
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
      // if (error instanceof DatabaseError) {throw RepositoryError.fromDatabaseError({ error, functionName }) }
      // if (error instanceof RepositoryError) {throw error }
      // throw RepositoryError.fromError({ error, functionName })
      //  순수 DB 관련 에러만 리턴
      throw error
    }
  }

  /**
   * 에러 로깅 및 변환
   */
  protected handleRepositoryError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): never {
    //  repository 계층보다 더 아래인 계층에서 발생한 에러인 경우
    if (error instanceof DatabaseError) {
      throw RepositoryError.fromDatabaseError({ error, functionName })
    }
    //  로깅
    ContextLogger.debug({
      message: `[Repository-Layer] ${this.repositoryName}.${functionName}() 오류 발생`,
      meta: {
        error: error instanceof Error ? error.message : String(error),
      },
    })
    //  Repository 계층에서 발생한 처리된 에러인 경우 그냥 상위 계층으로 전송
    if (error instanceof RepositoryError) {
      throw error
    }
    //  그 외의 처리되지 않은 에러는 RepositoryError로 변환하여 전송
    throw RepositoryError.fromError({ error, functionName, message })
  }
}
