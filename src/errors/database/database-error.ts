import { BaseError } from "../base/base-error"
import { ErrorLayer } from "../interfaces"

export enum DatabaseErrorCode {
  CONNECTION_ERROR = "DB_001",
  QUERY_ERROR = "DB_002",
  DATA_INTEGRITY_ERROR = "DB_003",
  RECORD_NOT_FOUND = "DB_004",
  TRANSACTION_ERROR = "DB_005",
}

export interface DatabaseErrorParams {
  functionName?: string
  message: string
  statusCode?: number
  cause?: unknown
  request?: string
  query?: string
  params?: any[]
}

export class DatabaseError extends BaseError {
  constructor({
    errorCode,
    statusCode,
    functionName = "-",
    request = "-",
    message,
    cause,
    query,
    params,
  }: DatabaseErrorParams & { errorCode: DatabaseErrorCode }) {
    // 상세 정보 구성
    const details: Record<string, any> = {}
    if (query) details.query = query
    if (params) details.params = params
    if (request && request !== "-") details.request = request

    super({
      errorCode,
      statusCode: 500,
      layer: "database" as ErrorLayer,
      functionName,
      message,
      cause,
      metadata: details,
    })
  }

  // 구체적인 데이터베이스 에러 팩토리 메서드들
  static connectionError({ functionName = "-", request = "-", message, cause, query }: Omit<DatabaseErrorParams, "params">): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.CONNECTION_ERROR,
      functionName,
      request,
      message,
      cause,
      query,
    })
  }

  static queryError({ functionName = "-", request = "-", message, cause, query, params }: DatabaseErrorParams): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.QUERY_ERROR,
      functionName,
      request,
      message,
      cause,
      query,
      params,
    })
  }

  static dataIntegrityError({ functionName = "-", request = "-", message, cause, query, params }: DatabaseErrorParams): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.DATA_INTEGRITY_ERROR,
      functionName,
      request,
      message,
      cause,
      query,
      params,
    })
  }

  static transactionError({ functionName = "-", request = "-", message, cause }: Omit<DatabaseErrorParams, "query" | "params">): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.TRANSACTION_ERROR,
      functionName,
      request,
      message,
      cause,
    })
  }

  // 일반 에러를 Database 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName = "-", message }: { error: unknown; functionName?: string; message: string }): DatabaseError {
    if (error instanceof DatabaseError) {
      return error
    } else if (error instanceof Error) {
      const msg = message || error.message
      return DatabaseError.queryError({
        functionName,
        message: msg || `Database 작업 중 예상치 못한 오류 발생`,
        cause: error,
      })
    } else {
      return DatabaseError.queryError({
        functionName,
        message: message || `Database 작업 중 예상치 못한 오류 발생`,
        cause: error,
      })
    }
  }
}
