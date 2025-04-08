import { ErrorCode } from "./error-codes"
import { ErrorIOptions, ErrorOptions } from "./interfaces"

export class ApiError extends Error {
  statusCode: number
  errorCode: ErrorCode
  details?: any

  constructor({ name, statusCode, message, errorCode, details }: ErrorOptions) {
    super(message || "")
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details
    this.name = name || this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  // 일반적인 에러 팩토리 메서드
  static badRequest({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 400,
      message,
      errorCode: ErrorCode.BAD_REQUEST,
      details,
    })
  }

  static unauthorized({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 401,
      message,
      errorCode: ErrorCode.UNAUTHORIZED,
      details,
    })
  }

  static forbidden({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 403,
      message,
      errorCode: ErrorCode.FORBIDDEN,
      details,
    })
  }

  static notFound({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 404,
      message,
      errorCode: ErrorCode.NOT_FOUND,
      details,
    })
  }

  static methodNotAllowed({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 405,
      message,
      errorCode: ErrorCode.METHOD_NOT_ALLOWED,
      details,
    })
  }

  static conflict({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 409,
      message,
      errorCode: ErrorCode.CONFLICT,
      details,
    })
  }

  static internal({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 500,
      message,
      errorCode: ErrorCode.INTERNAL_ERROR,
      details,
    })
  }

  // 서비스 이용 불가 오류
  static serviceUnavailable({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 503,
      message,
      errorCode: ErrorCode.SERVICE_UNAVAILABLE,
      details,
    })
  }

  // 비즈니스 도메인 에러 팩토리 메서드
  static validationError({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 400,
      message,
      errorCode: ErrorCode.VALIDATION_ERROR,
      details,
    })
  }

  static resourceExists({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 409,
      message,
      errorCode: ErrorCode.RESOURCE_EXISTS,
      details,
    })
  }

  static databaseError({ message, details }: ErrorIOptions): ApiError {
    return new ApiError({
      statusCode: 500,
      message,
      errorCode: ErrorCode.DATABASE_ERROR,
      details,
    })
  }
}
