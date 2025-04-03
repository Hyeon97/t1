// src/database/connection.ts
import mysql from "mysql2/promise"
import { DatabaseError } from "../errors/database/database-error"
import { ContextLogger } from "../utils/logger/logger.custom"

/**
 * 데이터베이스 설정을 가져오는 함수
 */
const getDbConfig = () => {
  return {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "test_database",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),
    waitForConnections: true,
    queueLimit: 0,
  }
}

/**
 * 데이터베이스 연결 풀 (싱글톤 패턴)
 */
export class DatabasePool {
  private static instance: DatabasePool
  private pool: mysql.Pool

  private constructor() {
    this.pool = mysql.createPool(getDbConfig())
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
        functionName: "testConnection",
        message: `데이터베이스 연결 실패: ${msg}`,
        cause: error,
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
        functionName: "getConnection",
        message: `데이터베이스 연결 가져오기 실패: ${msg}`,
        cause: error,
      })
    }
  }
}

/**
 * 민감한 데이터 검사 유틸리티 함수
 */
const containsSensitiveData = ({ sql, params }: { sql: string; params: any[] }): boolean => {
  const sensitiveKeywords = ["password", "token", "secret", "credit_card", "ssn"]

  // SQL 문에 민감한 키워드가 있는지 확인
  if (sensitiveKeywords.some((keyword) => sql.toLowerCase().includes(keyword))) {
    return true
  }

  // 매개변수에 민감한 키워드가 있는지 확인
  if (
    params.some((param) => {
      if (typeof param === "string") {
        return sensitiveKeywords.some((keyword) => param.includes(keyword))
      }
      return false
    })
  ) {
    return true
  }

  return false
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
  }: {
    sql: string
    params?: any[]
    connection?: mysql.PoolConnection
  }): Promise<T[]> {
    try {
      const pool = DatabasePool.getInstance().getPool()
      const conn = connection || pool
      const startTime = Date.now()

      // 민감한 데이터 로깅 방지
      const isSensitive = containsSensitiveData({ sql, params })

      if (!isSensitive) {
        ContextLogger.debug({
          message: `SQL: ${pool.format(sql, params)}`,
        })
      } else {
        ContextLogger.debug({
          message: `SQL: [민감한 데이터 포함 - 로깅 제한]`,
        })
      }

      const [rows] = await conn.execute(sql, params)

      const duration = Date.now() - startTime
      ContextLogger.debug({
        message: `쿼리 완료`,
        meta: {
          duration: `${duration}ms`,
          resultCount: Array.isArray(rows) ? rows.length : 1,
        },
      })

      return rows as T[]
    } catch (error: any) {
      // MySQL 에러 코드에 따른 특화된 에러 변환
      if (error.code) {
        switch (error.code) {
          case "ER_DUP_ENTRY":
            throw DatabaseError.dataIntegrityError({
              functionName: "executeQuery",
              message: `무결성 제약 조건 위반: ${error.message}`,
              cause: error,
              query: sql,
              params,
            })
          case "ER_NO_REFERENCED_ROW":
          case "ER_ROW_IS_REFERENCED":
            throw DatabaseError.dataIntegrityError({
              functionName: "executeQuery",
              message: `참조 무결성 위반: ${error.message}`,
              cause: error,
              query: sql,
              params,
            })
          case "ER_ACCESS_DENIED_ERROR":
            throw DatabaseError.connectionError({
              functionName: "executeQuery",
              message: `데이터베이스 접근 거부: ${error.message}`,
              cause: error,
              query: sql,
            })
          case "ER_PARSE_ERROR":
          case "ER_BAD_FIELD_ERROR":
            throw DatabaseError.queryError({
              functionName: "executeQuery",
              message: `SQL 구문 오류: ${error.message}`,
              cause: error,
              query: sql,
              params,
            })
          case "ER_BAD_DB_ERROR":
            throw DatabaseError.connectionError({
              functionName: "executeQuery",
              message: `데이터베이스를 찾을 수 없음: ${error.message}`,
              cause: error,
              query: sql,
            })
          case "ER_LOCK_DEADLOCK":
          case "ER_LOCK_WAIT_TIMEOUT":
            throw DatabaseError.transactionError({
              functionName: "executeQuery",
              message: `트랜잭션 오류: ${error.message}`,
              cause: error,
            })
          default:
            throw DatabaseError.queryError({
              functionName: "executeQuery",
              message: `쿼리 실행 오류(${error.code}): ${error.message}`,
              cause: error,
              query: sql,
              params,
            })
        }
      }

      // 일반적인 에러
      ContextLogger.error({
        message: `쿼리 오류: ${error.message}`,
        error,
      })

      throw DatabaseError.queryError({
        functionName: "executeQuery",
        message: `쿼리 실행 오류: ${error.message}`,
        cause: error,
        query: sql,
        params,
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
    errorOnNotFound = false,
  }: {
    sql: string
    params?: any[]
    connection?: mysql.PoolConnection
    errorOnNotFound?: boolean
  }): Promise<T | null> {
    const results = await this.executeQuery<T>({ sql, params, connection })

    if (results.length === 0 && errorOnNotFound) {
      throw DatabaseError.recordNotFoundError({
        functionName: "executeQuerySingle",
        message: "조회된 레코드가 없습니다",
        query: sql,
        params,
      })
    }

    return results.length ? results[0] : null
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
        functionName: "begin",
        message: `트랜잭션 시작 실패: ${msg}`,
        cause: error,
      })
    }
  }

  /**
   * 트랜잭션 커밋
   */
  public async commit(): Promise<void> {
    if (!this.connection) {
      throw DatabaseError.transactionError({
        functionName: "commit",
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
        functionName: "commit",
        message: `트랜잭션 커밋 실패: ${msg}`,
        cause: error,
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
        functionName: "rollback",
        message: `트랜잭션 롤백 실패: ${msg}`,
        cause: error,
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
        functionName: "getConnection",
        message: "활성 트랜잭션이 없습니다",
      })
    }
    return this.connection
  }

  /**
   * 트랜잭션 내에서 쿼리 실행
   */
  public async executeQuery<T>({ sql, params = [] }: { sql: string; params?: any[] }): Promise<T[]> {
    if (!this.connection) {
      throw DatabaseError.transactionError({
        functionName: "executeQuery",
        message: "활성 트랜잭션이 없습니다",
      })
    }

    return DatabaseOperations.executeQuery<T>({
      sql,
      params,
      connection: this.connection,
    })
  }

  /**
   * 트랜잭션 내에서 단일 결과 쿼리 실행
   */
  public async executeQuerySingle<T>({
    sql,
    params = [],
    errorOnNotFound = false,
  }: {
    sql: string
    params?: any[]
    errorOnNotFound?: boolean
  }): Promise<T | null> {
    if (!this.connection) {
      throw DatabaseError.transactionError({
        functionName: "executeQuerySingle",
        message: "활성 트랜잭션이 없습니다",
      })
    }

    return DatabaseOperations.executeQuerySingle<T>({
      sql,
      params,
      connection: this.connection,
      errorOnNotFound,
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
