import { BaseError, ErrorCode, ErrorLayer, ErrorParams } from ".."
import { RepositoryError } from "../repository/repository-error"
import { UtilityError } from "../utility/utility-error"

/**
 * 서비스 계층의 에러를 처리하는 클래스
 */
export class ServiceError extends BaseError {
  constructor(params: ErrorParams) {
    super({
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 일반 에러를 현재 타입으로 변환
  static fromError<T extends BaseError = ServiceError>(
    error: unknown,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "cause"> & {
      functionName: string
      message: string
      layer?: ErrorLayer
    }
  ): T {
    return BaseError.fromError(ServiceError as any, error, {
      ...params,
      layer: ErrorLayer.SERVICE,
    }) as unknown as T
  }

  // 공통 에러 타입들 - BaseError의 팩토리 메서드 활용

  // 잘못된 요청
  static badRequest<T extends BaseError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.badRequest(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 권한 없음
  static unauthorized<T extends BaseError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.unauthorized(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 유효성 검증 오류
  static validationError<T extends BaseError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.validationError(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 비즈니스 규칙 오류
  static businessRuleError<T extends BaseError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.businessRuleViolation(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 리소스 찾기 실패
  static resourceNotFoundError<T extends BaseError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.notFound(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 내부 오류
  static internalError<T extends BaseError = ServiceError>(
    constructor: new (params: ErrorParams) => T = ServiceError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.internalError(constructor, {
      ...params,
      layer: ErrorLayer.SERVICE,
    })
  }

  // 의존성 오류
  static dependencyError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): ServiceError {
    return BaseError.createFrom(ServiceError, {
      ...params,
      layer: ErrorLayer.SERVICE,
      errorCode: ErrorCode.DEPENDENCY_ERROR,
      statusCode: 502,
    })
  }

  // 데이터 처리 오류
  static dataProcessingError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): ServiceError {
    return BaseError.createFrom(ServiceError, {
      ...params,
      layer: ErrorLayer.SERVICE,
      errorCode: ErrorCode.DATA_PROCESSING_ERROR,
      statusCode: 500,
    })
  }

  // 트랜잭션 오류
  static transactionError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): ServiceError {
    return BaseError.createFrom(ServiceError, {
      ...params,
      layer: ErrorLayer.SERVICE,
      errorCode: ErrorCode.TRANSACTION_ERROR,
      statusCode: 500,
    })
  }

  // 다른 계층 에러로부터 변환

  // Repository 에러로부터 변환
  static fromRepositoryError({ error, functionName }: { error: RepositoryError; functionName: string }): ServiceError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 서비스 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.NOT_FOUND:
        return ServiceError.resourceNotFoundError(ServiceError, {
          functionName,
          message: `리소스를 찾을 수 없습니다`,
          cause: error,
        })

      case ErrorCode.VALIDATION_ERROR:
        return ServiceError.validationError(ServiceError, {
          functionName,
          message: `데이터 유효성 검증 실패`,
          cause: error,
        })

      case ErrorCode.DATA_INTEGRITY_ERROR:
        return ServiceError.businessRuleError(ServiceError, {
          functionName,
          message: `데이터 무결성 오류`,
          cause: error,
        })

      case ErrorCode.DATABASE_ERROR:
      case ErrorCode.QUERY_ERROR:
      case ErrorCode.CONNECTION_ERROR:
        return ServiceError.dependencyError({
          functionName,
          message: `데이터베이스 작업 중 오류 발생`,
          cause: error,
          metadata: { originalErrorCode },
        })

      default:
        return ServiceError.internalError(ServiceError, {
          functionName,
          message: `Repository 작업 중 오류 발생`,
          cause: error,
          metadata: { originalErrorCode },
        })
    }
  }

  // Utility 에러로부터 변환
  static fromUtilityError({ error, functionName }: { error: UtilityError; functionName: string }): ServiceError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 서비스 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.JWT_VERIFY_ERROR:
      case ErrorCode.JWT_EXPIRED:
      case ErrorCode.JWT_INVALID:
        return ServiceError.unauthorized(ServiceError, {
          functionName,
          message: `인증 중 오류 발생: ${error.message}`,
          cause: error,
        })

      case ErrorCode.VALIDATION_ERROR:
        return ServiceError.validationError(ServiceError, {
          functionName,
          message: error.message,
          cause: error,
        })

      case ErrorCode.NOT_FOUND:
        return ServiceError.resourceNotFoundError(ServiceError, {
          functionName,
          message: error.message,
          cause: error,
        })

      default:
        return ServiceError.internalError(ServiceError, {
          functionName,
          message: `Utility 작업 중 오류 발생: ${error.message}`,
          cause: error,
          metadata: { originalErrorCode },
        })
    }
  }
}
