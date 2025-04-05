import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"

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
  cause?: unknown
  request?: string
  query?: string
  params?: any[]
}

export class DatabaseError extends Error {
  public readonly errorChain: ErrorChainItem[]

  constructor({
    errorCode,
    functionName = "-",
    request = "-",
    message,
    cause,
    query,
    params,
  }: DatabaseErrorParams & { errorCode: DatabaseErrorCode }) {
    super(message)
    this.name = this.constructor.name

    //  DB 에러 상세 정의
    const details: Record<string, any> = {}
    if (query) details.query = query
    if (params) details.params = params
    if (cause) details.cause = cause instanceof Error ? cause.message : String(cause)

    // 에러 체인 생성
    this.errorChain = [
      createErrorChainItem({
        layer: "database" as ErrorLayer,
        functionName,
        request,
        errorCode,
        message,
        details,
      }),
    ]

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
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
}
