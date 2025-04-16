import mysql from "mysql2/promise"
import { configManager } from "../config/config-manager"
import { DatabaseError } from "../errors/database/database-error"
import { asyncContextStorage } from "../utils/AsyncContext"
import { ContextLogger } from "../utils/logger/logger.custom"
import { logger } from "../utils/logger/logger.util"

/**
 * 데이터베이스 연결 풀 (싱글톤 패턴)
 */
export class DatabasePool {
  private static instance: DatabasePool
  private pool: mysql.Pool

  private constructor() {
    try {
      // configManager에서 DB 설정 가져오기
      const dbConfig = configManager.getDatabaseConfig()
      this.pool = mysql.createPool(dbConfig)
      logger.info("데이터베이스 풀 생성 완료")
    } catch (error) {
      logger.error("데이터베이스 풀 생성 실패. 환경 변수에서 기본 설정을 사용합니다.", { error })
      // 기본 설정으로 풀 생성
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "test_database",
        port: parseInt(process.env.DB_PORT || "3306", 10),
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),
        waitForConnections: true,
        queueLimit: 0,
      })
    }
  }

  /**
   * 데이터베이스 풀 인스턴스 가져오기
   */
  public static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool()
    }
    return DatabasePool.instance
  }

  /**
   * 데이터베이스 연결 테스트
   */
  public async testConnection(): Promise<boolean> {
    let connection: mysql.PoolConnection | null = null

    try {
      connection = await this.pool.getConnection()
      ContextLogger.info({
        message: "데이터베이스 연결 성공",
      })
      return true
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      ContextLogger.error({
        message: `데이터베이스 연결 실패`,
        meta: {
          error: msg,
        },
      })
      throw DatabaseError.connectionError({
        method: "testConnection",
        message: `데이터베이스 연결 실패`,
        error,
      })
    } finally {
      if (connection) {
        connection.release()
      }
    }
  }

  /**
   * 데이터베이스 풀 접근
   */
  public getPool(): mysql.Pool {
    return this.pool
  }

  /**
   * 데이터베이스 연결 가져오기
   */
  public async getConnection(): Promise<mysql.PoolConnection> {
    try {
      return await this.pool.getConnection()
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      ContextLogger.error({
        message: `데이터베이스 연결 가져오기 실패`,
        meta: {
          error: msg,
        },
      })
      throw DatabaseError.connectionError({
        method: "getConnection",
        message: `데이터베이스 연결 가져오기 실패: ${msg}`,
        error,
      })
    }
  }
}

/**
 * 데이터베이스 작업 클래스
 * Repository 계층에서 사용되는 기본 데이터베이스 작업 메소드 제공
 */
export class DatabaseOperations {
  /**
   * 쿼리 실행
   */
  public static async executeQuery<T>({
    sql,
    params = [],
    connection,
    request,
  }: {
    sql: string
    params?: any[]
    connection?: mysql.PoolConnection
    request?: string //  해당 함수 요청 상위 Layer 함수 이름
  }): Promise<T> {
    try {
      const pool = DatabasePool.getInstance().getPool()
      const conn = connection || pool
      const startTime = Date.now()

      ContextLogger.debug({
        message: `SQL: ${pool.format(sql, params)}`,
      })
      asyncContextStorage.addSql({ query: pool.format(sql, params) })
      const [rows] = await conn.execute(sql, params)

      const duration = Date.now() - startTime
      ContextLogger.debug({
        message: `쿼리 완료`,
        meta: {
          duration: `${duration}ms`,
          resultCount: Array.isArray(rows) ? rows.length : 1,
        },
      })

      return rows as T
    } catch (error: any) {
      //  로깅
      ContextLogger.debug({
        message: `[Database-Layer] executeQuery() 오류 발생 ( 실행: ${request} )`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      // MySQL 에러 코드에 따른 특화된 에러 변환
      if (error.code) {
        switch (error.code) {
          case "ER_DUP_ENTRY":
            throw DatabaseError.dataIntegrityError({
              method: "executeQuery",
              request,
              message: `무결성 제약 조건 위반`,
              error,
              query: sql,
              params,
            })
          case "ER_NO_REFERENCED_ROW":
          case "ER_ROW_IS_REFERENCED":
            throw DatabaseError.dataIntegrityError({
              method: "executeQuery",
              request,
              message: `참조 무결성 위반`,
              error,
              query: sql,
              params,
            })
          case "ER_ACCESS_DENIED_ERROR":
            throw DatabaseError.connectionError({
              method: "executeQuery",
              request,
              message: `데이터베이스 접근 거부`,
              error,
              query: sql,
            })
          case "ER_PARSE_ERROR":
          case "ER_BAD_FIELD_ERROR":
            throw DatabaseError.queryError({
              method: "executeQuery",
              request,
              message: `SQL 구문 오류`,
              error,
              query: sql,
              params,
            })
          case "ER_BAD_DB_ERROR":
            throw DatabaseError.connectionError({
              method: "executeQuery",
              request,
              message: `데이터베이스를 찾을 수 없음`,
              error,
              query: sql,
            })
          case "ER_LOCK_DEADLOCK":
          case "ER_LOCK_WAIT_TIMEOUT":
            throw DatabaseError.transactionError({
              method: "executeQuery",
              request,
              message: `트랜잭션 오류`,
              error,
            })
          default:
            throw DatabaseError.queryError({
              method: "executeQuery",
              request,
              message: `쿼리 실행 오류(${error.code})`,
              error,
              query: sql,
              params,
            })
        }
      }

      // 일반적인 에러
      ContextLogger.error({
        message: `쿼리 오류`,
        error,
      })

      throw DatabaseError.queryError({
        method: "executeQuery",
        request,
        message: `쿼리 실행 오류`,
        error,
      })
    }
  }

  /**
   * 단일 결과 쿼리 실행
   */
  public static async executeQuerySingle<T>({
    sql,
    params = [],
    connection,
    request,
  }: {
    sql: string
    params?: any[]
    connection?: mysql.PoolConnection
    request?: string //  해당 함수 요청 상위 Layer 함수 이름
  }): Promise<T | null> {
    const results = await this.executeQuery<T[]>({ sql, params, connection, request })
    // 결과가 없으면 null 반환
    return results && results.length > 0 ? results[0] : null
  }
}

/**
 * 트랜잭션 관리 클래스
 * Service 계층에서 사용
 */
export class TransactionManager {
  private connection: mysql.PoolConnection | null = null

  private constructor(connection: mysql.PoolConnection) {
    this.connection = connection
  }

  /**
   * 새 트랜잭션 시작
   */
  public static async begin(): Promise<TransactionManager> {
    const connection = await DatabasePool.getInstance().getConnection()

    try {
      await connection.beginTransaction()
      ContextLogger.debug({
        message: "트랜잭션 시작됨",
      })
      return new TransactionManager(connection)
    } catch (error) {
      connection.release()
      const msg = error instanceof Error ? error.message : String(error)
      ContextLogger.error({
        message: `트랜잭션 시작 실패`,
        meta: {
          error: msg,
        },
      })
      throw DatabaseError.transactionError({
        method: "begin",
        message: `트랜잭션 시작 실패: ${msg}`,
        error,
      })
    }
  }

  /**
   * 트랜잭션 커밋
   */
  public async commit(): Promise<void> {
    if (!this.connection) {
      throw DatabaseError.transactionError({
        method: "commit",
        message: "커밋할 활성 트랜잭션이 없습니다",
      })
    }

    try {
      await this.connection.commit()
      ContextLogger.debug({
        message: "트랜잭션 커밋됨",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      ContextLogger.error({
        message: `트랜잭션 커밋 실패`,
        meta: {
          error: msg,
        },
      })
      throw DatabaseError.transactionError({
        method: "commit",
        message: `트랜잭션 커밋 실패: ${msg}`,
        error,
      })
    } finally {
      this.connection.release()
      this.connection = null
    }
  }

  /**
   * 트랜잭션 롤백
   */
  public async rollback(): Promise<void> {
    if (!this.connection) {
      return // 이미 트랜잭션이 종료되었다면 조용히 반환
    }

    try {
      await this.connection.rollback()
      ContextLogger.debug({
        message: "트랜잭션 롤백됨",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      ContextLogger.error({
        message: `트랜잭션 롤백 실패`,
        meta: {
          error: msg,
        },
      })
      throw DatabaseError.transactionError({
        method: "rollback",
        message: `트랜잭션 롤백 실패: ${msg}`,
        error,
      })
    } finally {
      this.connection.release()
      this.connection = null
    }
  }

  /**
   * 트랜잭션 연결 가져오기
   */
  public getConnection(): mysql.PoolConnection {
    if (!this.connection) {
      throw DatabaseError.transactionError({
        method: "getConnection",
        message: "활성 트랜잭션이 없습니다",
      })
    }
    return this.connection
  }

  /**
   * 트랜잭션 내에서 쿼리 실행
   */
  public async executeQuery<T>({ sql, params = [], request }: { sql: string; params?: any[]; request: string }): Promise<T> {
    if (!this.connection) {
      throw DatabaseError.transactionError({
        method: "executeQuery",
        request,
        message: "활성 트랜잭션이 없습니다",
      })
    }

    return DatabaseOperations.executeQuery<T>({
      sql,
      params,
      connection: this.connection,
      request,
    })
  }

  /**
   * 트랜잭션 내에서 단일 결과 쿼리 실행
   */
  public async executeQuerySingle<T>({ sql, params = [], request }: { sql: string; params?: any[]; request: string }): Promise<T | null> {
    if (!this.connection) {
      throw DatabaseError.transactionError({
        method: "executeQuerySingle",
        request,
        message: "활성 트랜잭션이 없습니다",
      })
    }

    return DatabaseOperations.executeQuerySingle<T>({
      sql,
      params,
      connection: this.connection,
      request,
    })
  }

  /**
   * 콜백 함수와 함께 트랜잭션 실행
   * 서비스 계층에서 편리하게 사용할 수 있는 헬퍼 메소드
   */
  public static async execute<T>({ callback }: { callback: (transaction: TransactionManager) => Promise<T> }): Promise<T> {
    const transaction = await TransactionManager.begin()

    try {
      const result = await callback(transaction)
      await transaction.commit()
      return result
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
