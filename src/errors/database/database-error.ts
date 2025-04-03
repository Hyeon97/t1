import { BaseError, ErrorDetails } from "../base/base-error"

export enum DatabaseErrorCode {
  CONNECTION_ERROR = "DB_001",
  QUERY_ERROR = "DB_002",
  DATA_INTEGRITY_ERROR = "DB_003",
  RECORD_NOT_FOUND = "DB_004",
  TRANSACTION_ERROR = "DB_005",
}

export interface DatabaseErrorDetails extends ErrorDetails {
  code: DatabaseErrorCode
  query?: string
  params?: any[]
}

export class DatabaseError extends BaseError {
  public readonly code: DatabaseErrorCode
  public readonly query?: string
  public readonly params?: any[]

  constructor({ functionName, message, code, cause, query, params, metadata }: DatabaseErrorDetails) {
    super({ functionName, message, cause, metadata })
    this.code = code
    this.query = query
    this.params = params
  }

  // 구체적인 데이터베이스 에러 타입 팩토리 메서드들
  static connectionError({ functionName, message, cause, query, metadata }: Omit<DatabaseErrorDetails, "code">): DatabaseError {
    return new DatabaseError({
      functionName,
      message,
      code: DatabaseErrorCode.CONNECTION_ERROR,
      cause,
      query,
      metadata,
    })
  }

  static queryError({ functionName, message, cause, query, params, metadata }: Omit<DatabaseErrorDetails, "code">): DatabaseError {
    return new DatabaseError({
      functionName,
      message,
      code: DatabaseErrorCode.QUERY_ERROR,
      cause,
      query,
      params,
      metadata,
    })
  }

  static dataIntegrityError({ functionName, message, cause, query, params, metadata }: Omit<DatabaseErrorDetails, "code">): DatabaseError {
    return new DatabaseError({
      functionName,
      message,
      code: DatabaseErrorCode.DATA_INTEGRITY_ERROR,
      cause,
      query,
      params,
      metadata,
    })
  }

  static recordNotFoundError({ functionName, message, cause, query, params, metadata }: Omit<DatabaseErrorDetails, "code">): DatabaseError {
    return new DatabaseError({
      functionName,
      message,
      code: DatabaseErrorCode.RECORD_NOT_FOUND,
      cause,
      query,
      params,
      metadata,
    })
  }

  static transactionError({ functionName, message, cause, metadata }: Omit<DatabaseErrorDetails, "code" | "query" | "params">): DatabaseError {
    return new DatabaseError({
      functionName,
      message,
      code: DatabaseErrorCode.TRANSACTION_ERROR,
      cause,
      metadata,
    })
  }
}
