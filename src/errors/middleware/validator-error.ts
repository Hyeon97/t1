import { BaseError, ErrorCode, ErrorLayer, ErrorParams } from ".."
import { ControllerError } from "../controller/controller-error"

/**
 * 검증 미들웨어 계층의 에러를 처리하는 클래스
 */
export class ValidatorError extends BaseError {
  constructor(params: ErrorParams) {
    // 메타데이터 설정
    const enhancedMetadata = {
      middlewareType: "validator",
      ...params.metadata,
    }
    super({
      ...params,
      layer: ErrorLayer.MIDDLEWARE,
      metadata: enhancedMetadata,
    })
  }

  // 일반 에러를 현재 타입으로 변환
  static fromError<T extends BaseError = ValidatorError>(error: unknown, params: Omit<ErrorParams, "errorCode" | "statusCode" | "cause">): T {
    if (error instanceof ValidatorError) {
      return error as unknown as T
    } else if (error instanceof ControllerError) {
      return ValidatorError.validationError(ValidatorError, {
        method: params.method,
        message: error.message,
      }) as unknown as T
    } else {
      return BaseError.fromError(ValidatorError as any, error, {
        ...params,
        layer: ErrorLayer.MIDDLEWARE,
      }) as unknown as T
    }
  }

  // 유효성 검증 오류
  static validationError<T extends BaseError = ValidatorError>(
    constructor: new (params: ErrorParams) => T = ValidatorError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return BaseError.validationError(constructor, {
      ...params,
      layer: ErrorLayer.MIDDLEWARE,
    })
  }

  // 토큰 필요
  static tokenRequired(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): ValidatorError {
    return BaseError.createFrom(ValidatorError, {
      ...params,
      message: params.message || "Token이 없습니다",
      layer: ErrorLayer.MIDDLEWARE,
      errorCode: ErrorCode.UNAUTHORIZED,
      statusCode: 401,
    })
  }

  // 유효하지 않은 토큰
  static tokenInvalid(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): ValidatorError {
    return BaseError.createFrom(ValidatorError, {
      ...params,
      message: params.message || "유효하지 않은 Token",
      layer: ErrorLayer.MIDDLEWARE,
      errorCode: ErrorCode.JWT_INVALID,
      statusCode: 401,
    })
  }

  // 만료된 토큰
  static tokenExpired(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): ValidatorError {
    return BaseError.createFrom(ValidatorError, {
      ...params,
      message: params.message || "Token 만료됨",
      layer: ErrorLayer.MIDDLEWARE,
      errorCode: ErrorCode.JWT_EXPIRED,
      statusCode: 502,
    })
  }

  // 권한 없음
  static permissionDenied<T extends BaseError = ValidatorError>(
    constructor: new (params: ErrorParams) => T = ValidatorError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return BaseError.unauthorized(constructor, {
      ...params,
      layer: ErrorLayer.MIDDLEWARE,
    })
  }

  // 내부 오류
  static internalError<T extends BaseError = ValidatorError>(
    constructor: new (params: ErrorParams) => T = ValidatorError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
    }
  ): T {
    return BaseError.internalError(constructor, {
      ...params,
      layer: ErrorLayer.MIDDLEWARE,
    })
  }
}
