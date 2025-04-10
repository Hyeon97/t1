import { errorToString } from "../../utils/error.utils"
import { BaseError } from "../base/base-error"
import { DatabaseErrorCode, DatabaseErrorParams } from "../error-types"

/**
 * 데이터베이스 계층의 에러를 처리하는 클래스
 */
export class DatabaseError extends BaseError {
  constructor({
    errorCode,
    functionName = "-",
    message,
    cause,
    statusCode = 500, // 데이터베이스 에러는 기본적으로 서버 오류
    request = "-",
    query,
    params
  }: DatabaseErrorParams & { errorCode: DatabaseErrorCode }) {
    // 상세 정보 구성
    const details: Record<string, any> = {}
    if (query) details.query = query
    if (params) details.params = params
    if (request && request !== "-") details.request = request

    super({
      errorCode,
      layer: "database",
      functionName,
      message,
      cause,
      metadata: details,
      statusCode
    })
  }

  // 연결 오류
  static connectionError({ functionName = "-", request = "-", message, cause, query, statusCode }: Omit<DatabaseErrorParams, "params">): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.CONNECTION_ERROR,
      functionName,
      request,
      message,
      cause,
      query,
      statusCode: statusCode || 500
    })
  }

  // 쿼리 실행 오류
  static queryError({ functionName = "-", request = "-", message, cause, query, params, statusCode }: DatabaseErrorParams): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.QUERY_ERROR,
      functionName,
      request,
      message,
      cause,
      query,
      params,
      statusCode: statusCode || 500
    })
  }

  // 데이터 무결성 오류
  static dataIntegrityError({ functionName = "-", request = "-", message, cause, query, params, statusCode }: DatabaseErrorParams): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.DATA_INTEGRITY_ERROR,
      functionName,
      request,
      message,
      cause,
      query,
      params,
      statusCode: statusCode || 500
    })
  }

  // 레코드 찾기 실패
  static recordNotFoundError({ functionName = "-", request = "-", message, cause, query, params, statusCode }: DatabaseErrorParams): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.RECORD_NOT_FOUND,
      functionName,
      request,
      message,
      cause,
      query,
      params,
      statusCode: statusCode || 404
    })
  }

  // 트랜잭션 오류
  static transactionError({ functionName = "-", request = "-", message, cause, statusCode }: Omit<DatabaseErrorParams, "query" | "params">): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.TRANSACTION_ERROR,
      functionName,
      request,
      message,
      cause,
      statusCode: statusCode || 500
    })
  }

  // 일반 에러를 Database 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName = "-", message }: { error: unknown; functionName?: string; message: string }): DatabaseError {
    if (error instanceof DatabaseError) {
      return error
    } else {
      const errorMsg = message || (error instanceof Error ? error.message : errorToString(error))

      return DatabaseError.queryError({
        functionName,
        message: errorMsg || `Database 작업 중 예상치 못한 오류 발생`,
        cause: error
      })
    }
  }
}