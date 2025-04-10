import { BaseError } from "../base/base-error"
import { DatabaseError, DatabaseErrorCode } from "../database/database-error"
import { ErrorLayer } from "../interfaces"

export enum RepositoryErrorCode {
  QUERY_EXECUTION = "REPO_001",
  ENTITY_NOT_FOUND = "REPO_002",
  DATA_MAPPING = "REPO_003",
  VALIDATION = "REPO_004",
  DATABASE = "REPO_005",
}

export interface RepositoryErrorParams {
  functionName: string
  message: string
  statusCode?: number
  cause?: unknown
  metadata?: Record<string, any>
}

export class RepositoryError extends BaseError {
  constructor({ errorCode, functionName, message, cause, metadata, statusCode }: RepositoryErrorParams & { errorCode: RepositoryErrorCode }) {
    super({
      errorCode,
      statusCode: 500,
      layer: "repository" as ErrorLayer,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // 팩토리 메서드들
  static queryExecutionError({ functionName, message, cause, metadata }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.QUERY_EXECUTION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static NotFoundError({ functionName, message, cause, metadata }: RepositoryErrorParams): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.ENTITY_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dataMappingError({ functionName, message, cause, metadata }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.DATA_MAPPING,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static validationError({ functionName, message, cause, metadata }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // 데이터베이스 에러를 Repository 에러로 변환하는 팩토리 메서드
  static fromDatabaseError({ error, functionName }: { error: DatabaseError; functionName: string }): RepositoryError {
    let repositoryError: RepositoryError

    switch (error.errorChain[0].errorCode) {
      case DatabaseErrorCode.DATA_INTEGRITY_ERROR:
        repositoryError = RepositoryError.validationError({
          functionName,
          message: `데이터 무결성 오류`,
          cause: error,
        })
        break
      default:
        repositoryError = RepositoryError.queryExecutionError({
          functionName,
          message: `데이터베이스 작업 중 오류 발생`,
          cause: error,
          metadata: { originalCode: error.errorChain[0].errorCode },
        })
    }

    return repositoryError
  }

  // 일반 에러를 Repository 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): RepositoryError {
    if (error instanceof DatabaseError) {
      return RepositoryError.fromDatabaseError({ error, functionName })
    } else if (error instanceof RepositoryError) {
      return error
    } else if (error instanceof Error) {
      const msg = message || error.message
      return RepositoryError.queryExecutionError({
        functionName,
        message: msg || `Repository 작업 중 예상치 못한 오류 발생`,
        cause: error,
      })
    } else {
      return RepositoryError.queryExecutionError({
        functionName,
        message: message || `Repository 작업 중 예상치 못한 오류 발생`,
        cause: error,
      })
    }
  }
}
