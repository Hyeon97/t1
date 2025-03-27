// src/database/Database.ts
import mysql from "mysql2/promise"
import { ConnectionError, DataIntegrityError, QueryError, RecordNotFoundError, TransactionError } from "../errors/domain-errors/DatabaseError"
import { logger } from "../utils/logger/logger.util"

// 환경 변수에서 데이터베이스 설정 가져오기
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test_database",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
  waitForConnections: true,
  queueLimit: 0,
}

// 커넥션 풀 생성
export const pool = mysql.createPool(dbConfig)

// 데이터베이스 연결 확인
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection()
    logger.info("데이터베이스 연결 성공")
    connection.release()
    return true
  } catch (error: any) {
    logger.error(`데이터베이스 연결 실패: ${error.message}`)
    throw new ConnectionError(`데이터베이스 연결 실패: ${error.message}`)
  }
}

// 민감한 데이터 검사 유틸리티 함수
const containsSensitiveData = (sql: string, params: any[]): boolean => {
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

// 쿼리 실행 헬퍼 함수 (개선됨)
export const executeQuery = async <T>({
  sql,
  params = [],
  connection,
  queryName = "unnamed",
}: {
  sql: string
  params?: any[]
  connection?: mysql.PoolConnection
  queryName?: string
}): Promise<T[]> => {
  try {
    const conn = connection || pool
    const startTime = Date.now() // 성능 측정 시작

    // 민감한 데이터 로깅 방지
    const isSensitive = containsSensitiveData(sql, params)

    if (!isSensitive) {
      logger.debug(`쿼리 실행: ${queryName}, SQL: ${pool.format(sql, params)}`)
    } else {
      logger.debug(`쿼리 실행: ${queryName}, SQL: [민감한 데이터 포함 - 로깅 제한]`)
    }

    const [rows] = await conn.execute(sql, params)

    const duration = Date.now() - startTime
    logger.debug(`쿼리 완료: ${queryName}, 소요시간: ${duration}ms, 결과 수: ${Array.isArray(rows) ? rows.length : 1}`)

    return rows as T[]
  } catch (error: any) {
    // MySQL 에러 코드에 따른 특화된 에러 반환
    if (error.code) {
      switch (error.code) {
        case "ER_DUP_ENTRY":
          throw new DataIntegrityError(`무결성 제약 조건 위반: ${error.message}`, sql, params)
        case "ER_NO_REFERENCED_ROW":
        case "ER_ROW_IS_REFERENCED":
          throw new DataIntegrityError(`참조 무결성 위반: ${error.message}`, sql, params)
        case "ER_ACCESS_DENIED_ERROR":
          throw new ConnectionError(`데이터베이스 접근 거부: ${error.message}`, sql)
        case "ER_PARSE_ERROR":
          throw new QueryError(`SQL 구문 오류: ${error.message}`, sql, params)
        case "ER_BAD_DB_ERROR":
          throw new ConnectionError(`데이터베이스를 찾을 수 없음: ${error.message}`, sql)
        default:
          throw new QueryError(`쿼리 실행 오류(${error.code}): ${error.message}`, sql, params)
      }
    }

    // 일반적인 에러
    logger.error(`쿼리 오류: ${queryName}, ${error.message}`)
    logger.debug(`SQL: ${sql}, 매개변수: ${JSON.stringify(params)}`)
    throw new QueryError(`쿼리 실행 오류: ${error.message}`, sql, params)
  }
}

// 단일 결과 쿼리 실행 헬퍼 함수 (개선됨)
export const executeQuerySingle = async <T>({
  sql,
  params = [],
  connection,
  queryName = "unnamed",
  errorOnNotFound = false,
}: {
  sql: string
  params?: any[]
  connection?: mysql.PoolConnection
  queryName?: string
  errorOnNotFound?: boolean
}): Promise<T | null> => {
  const results = await executeQuery<T>({ sql, params, connection, queryName })

  if (results.length === 0) {
    if (errorOnNotFound) {
      throw new RecordNotFoundError(`요청한 데이터를 찾을 수 없습니다: ${queryName}`, sql, params)
    }
    return null
  }

  return results[0]
}

// 트랜잭션 헬퍼 함수 (레거시 지원)
export const withTransaction = async <T>({ callback }: { callback: (connection: mysql.PoolConnection) => Promise<T> }): Promise<T> => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    logger.debug("트랜잭션 시작됨 (레거시 방식)")

    const result = await callback(connection)

    await connection.commit()
    logger.debug("트랜잭션 커밋됨 (레거시 방식)")

    return result
  } catch (error: any) {
    logger.debug("트랜잭션 롤백 시도 (레거시 방식)")
    await connection.rollback()

    if (
      error instanceof DataIntegrityError ||
      error instanceof QueryError ||
      error instanceof ConnectionError ||
      error instanceof RecordNotFoundError
    ) {
      throw error
    }

    throw new TransactionError(`트랜잭션 실패: ${error.message}`)
  } finally {
    connection.release()
  }
}

// Transaction 클래스 (새 방식)
export class Transaction {
  private connection: mysql.PoolConnection | null = null

  private constructor(connection: mysql.PoolConnection) {
    this.connection = connection
  }

  // 트랜잭션 시작
  public static async begin(): Promise<Transaction> {
    try {
      const connection = await pool.getConnection()

      try {
        await connection.beginTransaction()
        logger.debug("트랜잭션 시작됨")
        return new Transaction(connection)
      } catch (error: any) {
        connection.release()
        logger.error(`트랜잭션 시작 실패: ${error.message}`)
        throw new TransactionError(`트랜잭션 시작 실패: ${error.message}`)
      }
    } catch (error: any) {
      logger.error(`데이터베이스 연결 실패: ${error.message}`)
      throw new ConnectionError(`데이터베이스 연결 실패: ${error.message}`)
    }
  }

  // 트랜잭션 커밋
  public async commit(): Promise<void> {
    if (!this.connection) {
      throw new TransactionError("커밋할 활성 트랜잭션이 없습니다")
    }

    try {
      await this.connection.commit()
      logger.debug("트랜잭션 커밋됨")
    } catch (error: any) {
      logger.error(`트랜잭션 커밋 실패: ${error.message}`)
      throw new TransactionError(`트랜잭션 커밋 실패: ${error.message}`)
    } finally {
      this.connection.release()
      this.connection = null
    }
  }

  // 트랜잭션 롤백
  public async rollback(): Promise<void> {
    if (!this.connection) {
      return // 이미 트랜잭션이 종료되었다면 조용히 반환
    }

    try {
      await this.connection.rollback()
      logger.debug("트랜잭션 롤백됨")
    } catch (error: any) {
      logger.error(`트랜잭션 롤백 실패: ${error.message}`)
      throw new TransactionError(`트랜잭션 롤백 실패: ${error.message}`)
    } finally {
      this.connection.release()
      this.connection = null
    }
  }

  // 트랜잭션 연결 반환
  public getConnection(): mysql.PoolConnection {
    if (!this.connection) {
      throw new TransactionError("활성 트랜잭션이 없습니다")
    }
    return this.connection
  }

  // 트랜잭션 내 쿼리 실행
  public async executeQuery<T>(sql: string, params: any[] = [], queryName: string = "transaction-query"): Promise<T[]> {
    if (!this.connection) {
      throw new TransactionError("활성 트랜잭션이 없습니다")
    }

    return executeQuery<T>({
      sql,
      params,
      connection: this.connection,
      queryName,
    })
  }

  // 트랜잭션 내 단일 결과 쿼리 실행
  public async executeQuerySingle<T>(
    sql: string,
    params: any[] = [],
    queryName: string = "transaction-query-single",
    errorOnNotFound: boolean = false
  ): Promise<T | null> {
    if (!this.connection) {
      throw new TransactionError("활성 트랜잭션이 없습니다")
    }

    return executeQuerySingle<T>({
      sql,
      params,
      connection: this.connection,
      queryName,
      errorOnNotFound,
    })
  }
}
