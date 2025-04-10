import { BaseError, ErrorCode, ErrorLayer, ErrorParams } from ".."
import { ServiceError } from "../service/service-error"
import { UtilityError } from "../utility/utility-error"

/**
 * 컨트롤러 계층의 에러를 처리하는 클래스
 */
export class ControllerError extends BaseError {
  constructor(params: ErrorParams) {
    super({
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 일반 에러를 현재 타입으로 변환
  static fromError<T extends BaseError = ControllerError>(
    error: unknown,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "cause"> & {
      functionName: string
      message: string
      layer?: ErrorLayer
    }
  ): T {
    // 다른 계층 에러 처리
    // if (error instanceof ServiceError) {
    //   return ControllerError.fromServiceError({ error, functionName })
    // } else if (error instanceof UtilityError) {
    //   return ControllerError.fromUtilityError({ error, functionName })
    // } else if (error instanceof ControllerError) {
    //   return error
    // }
    return BaseError.fromError(ControllerError as any, error, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    }) as unknown as T
  }

  // 공통 에러 타입들 - BaseError의 팩토리 메서드 활용

  // 잘못된 요청
  static badRequest<T extends BaseError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.badRequest(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 권한 없음
  static unauthorized<T extends BaseError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.unauthorized(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 유효성 검증 오류
  static validationError<T extends BaseError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.validationError(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 비즈니스 규칙 오류
  static businessRuleError<T extends BaseError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.businessRuleViolation(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 리소스 찾기 실패
  static resourceNotFoundError<T extends BaseError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.notFound(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 내부 오류
  static internalError<T extends BaseError = ControllerError>(
    constructor: new (params: ErrorParams) => T = ControllerError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.internalError(constructor, {
      ...params,
      layer: ErrorLayer.CONTROLLER,
    })
  }

  // 다른 계층 에러로부터 변환

  // Service 에러로부터 변환
  static fromServiceError({ error, functionName }: { error: ServiceError; functionName: string }): ControllerError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 컨트롤러 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.NOT_FOUND:
        return ControllerError.resourceNotFoundError(ControllerError, {
          functionName,
          message: `요청한 리소스를 찾을 수 없습니다`,
          cause: error,
        })

      case ErrorCode.VALIDATION_ERROR:
        return ControllerError.validationError(ControllerError, {
          functionName,
          message: `요청 데이터 유효성 검증 실패`,
          cause: error,
        })

      case ErrorCode.BUSINESS_RULE_VIOLATION:
        return ControllerError.badRequest(ControllerError, {
          functionName,
          message: `비즈니스 규칙 위반`,
          cause: error,
        })

      case ErrorCode.UNAUTHORIZED:
        return ControllerError.unauthorized(ControllerError, {
          functionName,
          message: `인증 실패`,
          cause: error,
        })

      // case ErrorCode.FORBIDDEN:
      //   return ControllerError.forbidden(ControllerError, {
      //     functionName,
      //     message: `권한 없음`,
      //     cause: error,
      //   })

      default:
        return ControllerError.internalError(ControllerError, {
          functionName,
          message: `서버 내부 오류가 발생했습니다`,
          cause: error,
          metadata: { originalErrorCode },
        })
    }
  }

  // Utility 에러로부터 변환
  static fromUtilityError({ error, functionName }: { error: UtilityError; functionName: string }): ControllerError {
    const originalErrorCode = error.errorCode

    // 에러 코드에 따라 적절한 서비스 에러로 변환
    switch (originalErrorCode) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.JWT_VERIFY_ERROR:
      case ErrorCode.JWT_EXPIRED:
      case ErrorCode.JWT_INVALID:
        return ControllerError.unauthorized(ControllerError, {
          functionName,
          message: `인증 중 오류 발생: ${error.message}`,
          cause: error,
        })

      case ErrorCode.VALIDATION_ERROR:
        return ControllerError.validationError(ControllerError, {
          functionName,
          message: error.message,
          cause: error,
        })

      case ErrorCode.NOT_FOUND:
        return ControllerError.resourceNotFoundError(ControllerError, {
          functionName,
          message: error.message,
          cause: error,
        })

      default:
        return ControllerError.internalError(ControllerError, {
          functionName,
          message: `Utility 작업 중 오류 발생: ${error.message}`,
          cause: error,
          metadata: { originalErrorCode },
        })
    }
  }
}
