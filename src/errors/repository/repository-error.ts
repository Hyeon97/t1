import { BaseError, ErrorCode, ErrorLayer, ErrorParams } from ".."
import { DatabaseError } from "../database/database-error"

/**
 * 리포지토리 계층의 에러를 처리하는 클래스
 */
export class RepositoryError extends BaseError {
  constructor(params: ErrorParams) {
    super({
      ...params,
      layer: ErrorLayer.REPOSITORY,
    })
  }

  // 일반 에러를 현재 타입으로 변환
  static fromError<T extends BaseError = RepositoryError>(
    error: unknown,
    params: Omit<ErrorParams, "layer" | "errorCode" | "statusCode" | "cause">
  ): T {
    // // 데이터베이스 에러 처리
    // if (error instanceof DatabaseError) {
    //   return RepositoryError.fromDatabaseError({ error, method })
    // } else if (error instanceof RepositoryError) {
    //   return error
    // }
    return BaseError.fromError(RepositoryError as any, error, {
      ...params,
      layer: ErrorLayer.REPOSITORY,
    }) as unknown as T
  }

  // 공통 에러 타입들 - BaseError의 팩토리 메서드 활용

  // 리소스 찾기 실패
  static resourceNotFoundError<T extends BaseError = RepositoryError>(
    constructor: new (params: ErrorParams) => T = RepositoryError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return BaseError.notFound(constructor, {
      ...params,
      layer: ErrorLayer.REPOSITORY,
    })
  }

  // 유효성 검증 오류
  static validationError<T extends BaseError = RepositoryError>(
    constructor: new (params: ErrorParams) => T = RepositoryError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return BaseError.validationError(constructor, {
      ...params,
      layer: ErrorLayer.REPOSITORY,
    })
  }

  // 쿼리 실행 오류
  static queryExecutionError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): RepositoryError {
    return BaseError.createFrom(RepositoryError, {
      ...params,
      layer: ErrorLayer.REPOSITORY,
      errorCode: ErrorCode.QUERY_ERROR,
      statusCode: 500,
    })
  }

  // 데이터 매핑 오류
  static dataMappingError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): RepositoryError {
    return BaseError.createFrom(RepositoryError, {
      ...params,
      layer: ErrorLayer.REPOSITORY,
      errorCode: ErrorCode.DATA_MAPPING_ERROR,
      statusCode: 500,
    })
  }

  // 데이터베이스 에러로부터 변환
  static fromDatabaseError({ error, method }: { error: DatabaseError; method: string }): RepositoryError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 리포지토리 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.DATA_INTEGRITY_ERROR:
        return RepositoryError.validationError(RepositoryError, {
          method,
          message: `데이터 무결성 오류`,
          cause: error,
        })

      case ErrorCode.NOT_FOUND:
        return RepositoryError.resourceNotFoundError(RepositoryError, {
          method,
          message: `데이터를 찾을 수 없음`,
          cause: error,
        })

      case ErrorCode.CONNECTION_ERROR:
        return RepositoryError.queryExecutionError({
          method,
          message: `데이터베이스 연결 오류`,
          cause: error,
          metadata: { originalErrorCode },
        })

      case ErrorCode.QUERY_ERROR:
        return RepositoryError.queryExecutionError({
          method,
          message: `쿼리 실행 오류`,
          cause: error,
          metadata: { originalErrorCode },
        })

      default:
        return RepositoryError.queryExecutionError({
          method,
          message: `데이터베이스 작업 중 오류 발생`,
          cause: error,
          metadata: { originalErrorCode },
        })
    }
  }
}
