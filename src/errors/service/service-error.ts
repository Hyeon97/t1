import { ErrorCode, ErrorLayer, ErrorParams, NewError } from ".."
import { RepositoryError } from "../repository/repository-error"
import { UtilityError } from "../utility/utility-error"

/**
 * 서비스 계층의 에러를 처리하는 클래스
 */
export class ServiceError extends NewError {
  constructor(params: ErrorParams) {
    super({
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  /**
   * Service 계층에서 정의되지 않은 일반 Error 발생시
   * 헤당 Error를 Service 계층 Error 로 변환
   */
  static fromError<T extends NewError = ServiceError>(
    error: unknown,
    params: Omit<ErrorParams, "layer" | "errorCode" | "statusCode">
  ): T {
    return NewError.fromError(ServiceError as any, error, {
      ...params,
      layer: ErrorLayer.SERVICE,
      errorCode: ErrorCode.INTERNAL_ERROR,
      statusCode: 500
    }) as unknown as T
  }

  // 공통 에러 타입들 - BaseError의 팩토리 메서드 활용

  // 잘못된 요청
  static badRequest<T extends NewError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.badRequest(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 권한 없음
  static unauthorized<T extends NewError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.unauthorized(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 유효성 검증 오류
  static validationError<T extends NewError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.validationError(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 비즈니스 규칙 오류
  static businessRuleError<T extends NewError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.businessRuleViolation(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 리소스 찾기 실패
  static resourceNotFoundError<T extends NewError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.notFound(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 내부 오류
  static internalError<T extends NewError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.internalError(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 의존성 오류
  static dependencyError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): ServiceError {
    return NewError.createFrom(ServiceError, {
      ...params,
      layer: ErrorLayer.SERVICE,
      errorCode: ErrorCode.DEPENDENCY_ERROR,
      statusCode: 502,
    })
  }

  // 데이터 처리 오류
  static dataProcessingError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): ServiceError {
    return NewError.createFrom(ServiceError, {
      ...params,
      layer: ErrorLayer.SERVICE,
      errorCode: ErrorCode.DATA_PROCESSING_ERROR,
      statusCode: 500,
    })
  }

  // 트랜잭션 오류
  static transactionError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): ServiceError {
    return NewError.createFrom(ServiceError, {
      ...params,
      layer: ErrorLayer.SERVICE,
      errorCode: ErrorCode.TRANSACTION_ERROR,
      statusCode: 500,
    })
  }

  // 데이터 삭제 오류
  static deletionError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): ServiceError {
    // console.log('ServiceError-deletionError')
    // console.dir(params)
    return NewError.createFrom(ServiceError, {
      ...params,
      layer: ErrorLayer.SERVICE,
      errorCode: ErrorCode.DATA_DELETION_ERROR,
      statusCode: 500,
    })
  }

  // 다른 계층 에러로부터 변환

  // Repository 에러로부터 변환
  static fromRepositoryError({ error, method }: { error: RepositoryError; method: string }): ServiceError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 서비스 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.NOT_FOUND:
        return ServiceError.resourceNotFoundError(ServiceError, {
          method,
          message: `리소스를 찾을 수 없습니다`,
          error,
        })

      case ErrorCode.VALIDATION_ERROR:
        return ServiceError.validationError(ServiceError, {
          method,
          message: `데이터 유효성 검증 실패`,
          error,
        })

      case ErrorCode.DATA_INTEGRITY_ERROR:
        return ServiceError.businessRuleError(ServiceError, {
          method,
          message: `데이터 무결성 오류`,
          error,
        })

      case ErrorCode.DATABASE_ERROR:
      case ErrorCode.QUERY_ERROR:
      case ErrorCode.CONNECTION_ERROR:
        return ServiceError.dependencyError({
          method,
          message: `데이터베이스 작업 중 오류 발생`,
          error,
          metadata: { originalErrorCode },
        })

      default:
        return ServiceError.internalError(ServiceError, {
          method,
          message: `Repository 작업 중 오류 발생`,
          error,
          metadata: { originalErrorCode },
        })
    }
  }

  // Utility 에러로부터 변환
  static fromUtilityError({ error, method }: { error: UtilityError; method: string }): ServiceError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 서비스 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.JWT_VERIFY_ERROR:
      case ErrorCode.JWT_EXPIRED:
      case ErrorCode.JWT_INVALID:
        return ServiceError.unauthorized(ServiceError, {
          method,
          message: `인증 중 오류 발생: ${error.message}`,
          error,
        })

      case ErrorCode.VALIDATION_ERROR:
        return ServiceError.validationError(ServiceError, {
          method,
          message: error.message,
          error,
        })

      case ErrorCode.NOT_FOUND:
        return ServiceError.resourceNotFoundError(ServiceError, {
          method,
          message: error.message,
          error,
        })

      default:
        return ServiceError.internalError(ServiceError, {
          method,
          message: `Utility 작업 중 오류 발생: ${error.message}`,
          error,
          metadata: { originalErrorCode },
        })
    }
  }
}
