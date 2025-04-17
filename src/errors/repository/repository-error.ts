import { ErrorCode, ErrorLayer, ErrorParams, NewError } from ".."
import { DatabaseError } from "../database/database-error"

/**
 * 리포지토리 계층의 에러를 처리하는 클래스
 */
export class RepositoryError extends NewError {
  constructor(params: ErrorParams) {
    super({
      ...params,
      layer: ErrorLayer.REPOSITORY,
    })
  }

  /**
   * Repository 계층에서 정의되지 않은 일반 Error 발생시
   * 헤당 Error를 Repository 계층 Error 로 변환
   */
  static fromError<T extends NewError = RepositoryError>(
    error: unknown,
    params: Omit<ErrorParams, "layer" | "errorCode" | "statusCode">
  ): T {
    // console.log('RepositoryError-fromError-error')
    // console.dir(error, { depth: null })
    // console.log('RepositoryError-fromError-params')
    // console.dir(params, { depth: null })
    let originMessage = error instanceof Error ? error.message : String(error)
    if (params.message) originMessage = params.message
    return NewError.fromError(RepositoryError, error, {
      ...params,
      message: originMessage,
      layer: ErrorLayer.REPOSITORY,
      errorCode: ErrorCode.INTERNAL_ERROR,
    }) as unknown as T
  }

  // 공통 에러 타입들 - BaseError의 팩토리 메서드 활용

  // 리소스 찾기 실패
  static resourceNotFoundError<T extends NewError = RepositoryError>(
    constructor: new (params: ErrorParams) => T = RepositoryError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.notFound(constructor, {
      ...params,
      layer: ErrorLayer.REPOSITORY,
    })
  }

  // 유효성 검증 오류
  static validationError<T extends NewError = RepositoryError>(
    constructor: new (params: ErrorParams) => T = RepositoryError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.validationError(constructor, {
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
    return NewError.createFrom(RepositoryError, {
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
    return NewError.createFrom(RepositoryError, {
      ...params,
      layer: ErrorLayer.REPOSITORY,
      errorCode: ErrorCode.DATA_MAPPING_ERROR,
      statusCode: 500,
    })
  }

  // 데이터 삭제 오류
  static deletionError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): RepositoryError {
    return NewError.createFrom(RepositoryError, {
      ...params,
      layer: ErrorLayer.REPOSITORY,
      errorCode: ErrorCode.DATA_DELETION_ERROR,
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
          error,
        })

      case ErrorCode.NOT_FOUND:
        return RepositoryError.resourceNotFoundError(RepositoryError, {
          method,
          message: `데이터를 찾을 수 없음`,
          error,
        })

      case ErrorCode.CONNECTION_ERROR:
        return RepositoryError.queryExecutionError({
          method,
          message: `데이터베이스 연결 오류`,
          error,
          metadata: { originalErrorCode },
        })

      case ErrorCode.QUERY_ERROR:
        return RepositoryError.queryExecutionError({
          method,
          message: `쿼리 실행 오류`,
          error,
          metadata: { originalErrorCode },
        })

      default:
        return RepositoryError.queryExecutionError({
          method,
          message: `데이터베이스 작업 중 오류 발생`,
          error,
          metadata: { originalErrorCode },
        })
    }
  }
}
