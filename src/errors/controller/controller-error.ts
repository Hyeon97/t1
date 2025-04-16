import { ErrorCode, ErrorLayer, ErrorParams, NewError } from ".."
import { ServiceError } from "../service/service-error"
import { UtilityError } from "../utility/utility-error"

/**
 * 컨트롤러 계층의 에러를 처리하는 클래스
 */
export class ControllerError extends NewError {
  constructor(params: ErrorParams) {
    super({
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  /**
   * Controller 계층에서 정의되지 않은 일반 Error 발생시
   * 헤당 Error를 Controller 계층 Error 로 변환
   */
  static fromError<T extends NewError = ControllerError>(
    error: unknown,
    params: Omit<ErrorParams, "layer" | "errorCode" | "statusCode">
  ): T {
    return NewError.fromError(ControllerError as any, error, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
      errorCode: ErrorCode.INTERNAL_ERROR,
      statusCode: 500
    }) as unknown as T
  }

  // 공통 에러 타입들 - BaseError의 팩토리 메서드 활용

  // 잘못된 요청
  static badRequest<T extends NewError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer">
  ): T {
    return NewError.badRequest(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 권한 없음
  static unauthorized<T extends NewError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.unauthorized(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 유효성 검증 오류
  static validationError<T extends NewError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.validationError(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 비즈니스 규칙 오류
  static businessRuleError<T extends NewError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.businessRuleViolation(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 리소스 찾기 실패
  static resourceNotFoundError<T extends NewError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.notFound(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 내부 오류
  static internalError<T extends NewError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return NewError.internalError(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 다른 계층 에러로부터 변환

  // Service 에러로부터 변환
  static fromServiceError({ error, method }: { error: ServiceError; method: string }): ControllerError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 컨트롤러 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.NOT_FOUND:
        return ControllerError.resourceNotFoundError(ControllerError, {
          method,
          message: `요청한 리소스를 찾을 수 없습니다`,
          error,
        })

      case ErrorCode.VALIDATION_ERROR:
        return ControllerError.validationError(ControllerError, {
          method,
          message: `요청 데이터 유효성 검증 실패`,
          error,
        })

      case ErrorCode.BUSINESS_RULE_VIOLATION:
        return ControllerError.badRequest(ControllerError, {
          method,
          message: `비즈니스 규칙 위반`,
          error,
        })

      case ErrorCode.UNAUTHORIZED:
        return ControllerError.unauthorized(ControllerError, {
          method,
          message: `인증 실패`,
          error,
        })

      // case ErrorCode.FORBIDDEN:
      //   return ControllerError.forbidden(ControllerError, {
      //     method,
      //     message: `권한 없음`,
      //     error,
      //   })

      default:
        return ControllerError.internalError(ControllerError, {
          method,
          message: `서버 내부 오류가 발생했습니다`,
          error,
          metadata: { originalErrorCode },
        })
    }
  }

  // Utility 에러로부터 변환
  static fromUtilityError({ error, method }: { error: UtilityError; method: string }): ControllerError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 서비스 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.JWT_VERIFY_ERROR:
      case ErrorCode.JWT_EXPIRED:
      case ErrorCode.JWT_INVALID:
        return ControllerError.unauthorized(ControllerError, {
          method,
          message: `인증 중 오류 발생: ${error.message}`,
          error,
        })

      case ErrorCode.VALIDATION_ERROR:
        return ControllerError.validationError(ControllerError, {
          method,
          message: error.message,
          error,
        })

      case ErrorCode.NOT_FOUND:
        return ControllerError.resourceNotFoundError(ControllerError, {
          method,
          message: error.message,
          error,
        })

      default:
        return ControllerError.internalError(ControllerError, {
          method,
          message: `Utility 작업 중 오류 발생: ${error.message}`,
          error,
          metadata: { originalErrorCode },
        })
    }
  }
}
