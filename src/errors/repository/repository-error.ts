import { errorToString } from "../../utils/error.utils"
import { BaseError } from "../base/base-error"
import { DatabaseError } from "../database/database-error"
import { DatabaseErrorCode, RepositoryErrorCode, RepositoryErrorParams } from "../error-types"

/**
 * 리포지토리 계층의 에러를 처리하는 클래스
 */
export class RepositoryError extends BaseError {
  constructor({
    errorCode,
    functionName,
    message,
    cause,
    metadata,
    statusCode = 500
  }: RepositoryErrorParams & { errorCode: RepositoryErrorCode }) {
    super({
      errorCode,
      layer: "repository",
      functionName,
      message,
      cause,
      metadata,
      statusCode
    })
  }

  // 쿼리 실행 오류
  static queryExecutionError({ functionName, message, cause, metadata, statusCode }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.QUERY_EXECUTION,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 500
    })
  }

  // 엔티티 찾기 실패
  static notFoundError({ functionName, message, cause, metadata, statusCode }: RepositoryErrorParams): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.ENTITY_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 404
    })
  }

  // 데이터 매핑 오류
  static dataMappingError({ functionName, message, cause, metadata, statusCode }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.DATA_MAPPING,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 500
    })
  }

  // 유효성 검증 오류
  static validationError({ functionName, message, cause, metadata, statusCode }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 400
    })
  }

  // 데이터베이스 에러를 Repository 에러로 변환하는 팩토리 메서드
  static fromDatabaseError({ error, functionName }: { error: DatabaseError; functionName: string }): RepositoryError {
    const dbErrorItem = error.errorChain[0]
    const errorCode = dbErrorItem.errorCode as DatabaseErrorCode
    const statusCode = dbErrorItem.statusCode

    switch (errorCode) {
      case DatabaseErrorCode.DATA_INTEGRITY_ERROR:
        return RepositoryError.validationError({
          functionName,
          message: `데이터 무결성 오류`,
          cause: error,
          statusCode
        })
      case DatabaseErrorCode.RECORD_NOT_FOUND:
        return RepositoryError.notFoundError({
          functionName,
          message: `데이터를 찾을 수 없음`,
          cause: error,
          statusCode
        })
      default:
        return RepositoryError.queryExecutionError({
          functionName,
          message: `데이터베이스 작업 중 오류 발생`,
          cause: error,
          metadata: { originalCode: errorCode },
          statusCode
        })
    }
  }

  // 일반 에러를 Repository 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): RepositoryError {
    if (error instanceof DatabaseError) {
      return RepositoryError.fromDatabaseError({ error, functionName })
    } else if (error instanceof RepositoryError) {
      return error
    } else {
      const errorMsg = message || (error instanceof Error ? error.message : errorToString(error))

      return RepositoryError.queryExecutionError({
        functionName,
        message: errorMsg || `Repository 작업 중 예상치 못한 오류 발생`,
        cause: error
      })
    }
  }
}