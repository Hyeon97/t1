import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"

export enum DatabaseErrorCode {
  CONNECTION_ERROR = "DB_001",
  QUERY_ERROR = "DB_002",
  DATA_INTEGRITY_ERROR = "DB_003",
  RECORD_NOT_FOUND = "DB_004",
  TRANSACTION_ERROR = "DB_005"
}

export interface DatabaseErrorParams {
  functionName: string
  message: string
  cause?: unknown
  query?: string
  params?: any[]
  metadata?: Record<string, any>
}

export class DatabaseError extends Error {
  public readonly errorChain: ErrorChainItem[]

  constructor({
    errorCode,
    functionName,
    message,
    cause,
    query,
    params,
    metadata
  }: DatabaseErrorParams & { errorCode: DatabaseErrorCode }) {
    super(message)
    this.name = this.constructor.name

    // 에러 체인 생성
    const details: Record<string, any> = { ...metadata }
    if (query) details.query = query
    if (params) details.params = params
    if (cause) details.cause = cause instanceof Error ? cause.message : String(cause)

    this.errorChain = [
      createErrorChainItem({
        layer: "database" as ErrorLayer,
        entityName: "Database",
        functionName,
        errorCode,
        message,
        details
      })
    ]

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }

  // 구체적인 데이터베이스 에러 팩토리 메서드들
  static connectionError({
    functionName,
    message,
    cause,
    query,
    metadata
  }: Omit<DatabaseErrorParams, "params">): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.CONNECTION_ERROR,
      functionName,
      message,
      cause,
      query,
      metadata
    })
  }

  static queryError({
    functionName,
    message,
    cause,
    query,
    params,
    metadata
  }: DatabaseErrorParams): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.QUERY_ERROR,
      functionName,
      message,
      cause,
      query,
      params,
      metadata
    })
  }

  static dataIntegrityError({
    functionName,
    message,
    cause,
    query,
    params,
    metadata
  }: DatabaseErrorParams): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.DATA_INTEGRITY_ERROR,
      functionName,
      message,
      cause,
      query,
      params,
      metadata
    })
  }

  static recordNotFoundError({
    functionName,
    message,
    cause,
    query,
    params,
    metadata
  }: DatabaseErrorParams): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.RECORD_NOT_FOUND,
      functionName,
      message,
      cause,
      query,
      params,
      metadata
    })
  }

  static transactionError({
    functionName,
    message,
    cause,
    metadata
  }: Omit<DatabaseErrorParams, "query" | "params">): DatabaseError {
    return new DatabaseError({
      errorCode: DatabaseErrorCode.TRANSACTION_ERROR,
      functionName,
      message,
      cause,
      metadata
    })
  }
}