import { ErrorCode, ErrorLayer, ErrorOptions, ErrorParams, NewError } from "."

/**
 * 레거시 호환성을 위한 ApiError 클래스
 * BaseError를 상속하여 새 에러 시스템과 통합
 */
export class ApiError extends NewError {
  details?: any

  constructor({ name, statusCode, message, errorCode, details }: ErrorOptions) {
    super({
      errorCode,
      layer: ErrorLayer.CONTROLLER, // API 에러는 컨트롤러 계층에서 발생한 것으로 간주
      method: "apiRequest",
      message: message || "",
      statusCode,
    })

    this.details = details
    this.name = name || this.constructor.name
  }

  // 일반적인 에러 팩토리 메서드들 - 레거시 호환성 유지
  // 400 Bad Request
  static badRequest<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.badRequest(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
    })
  }

  // 401 Unauthorized
  static unauthorized<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.unauthorized(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
    })
  }

  // 403 Forbidden
  static forbidden<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.forbidden(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
    })
  }

  // 404 Not Found
  static notFound<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.notFound(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
    })
  }

  // 405 Method Not Allowed
  static methodNotAllowed<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.createFrom(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
      errorCode: ErrorCode.METHOD_NOT_ALLOWED,
      statusCode: 405,
    })
  }

  // 409 Conflict
  static conflict<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.createFrom(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
      errorCode: ErrorCode.CONFLICT,
      statusCode: 409,
    })
  }

  // 500 Internal Server Error
  static internal<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.internalError(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
    })
  }

  // 503 Service Unavailable
  static serviceUnavailable<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.createFrom(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
      errorCode: ErrorCode.SERVICE_UNAVAILABLE,
      statusCode: 503,
    })
  }

  // 비즈니스 도메인 에러 팩토리 메서드
  static validationError<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.validationError(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
    })
  }

  static resourceExists<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.createFrom(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
      errorCode: ErrorCode.RESOURCE_EXISTS,
      statusCode: 409,
    })
  }

  static databaseError<T extends NewError = ApiError>(
    constructor: new (params: ErrorParams) => T = ApiError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode"> = { layer: ErrorLayer.CONTROLLER, method: "apiRequest", message: "" }
  ): T {
    return NewError.databaseError(constructor, {
      ...params,
      layer: params.layer || ErrorLayer.CONTROLLER,
    })
  }
}
