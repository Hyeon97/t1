import { errorToString } from ".."
import { ErrorCode, ErrorParams } from "../error-types"
import { getStatusCodeFromErrorCode } from "../status-code-mapper"

/**
 * 모든 계층별 에러의 기본 클래스
 * 에러 체인 관리 및 공통 팩토리 메서드 제공
 */
export class NewError extends Error {
  // public readonly errorChain: ErrorChainItem[]
  public readonly statusCode: number
  public readonly errorCode: ErrorCode
  // public readonly layer: ErrorLayer
  public readonly metadata?: Record<string, any>

  constructor({ errorCode, layer, method, message, error, metadata, statusCode, application }: ErrorParams) {
    super(message)
    this.name = this.constructor.name
    this.errorCode = errorCode

    // 상태 코드가 명시적으로 제공되지 않은 경우 에러 코드에서 유추
    this.statusCode = statusCode || getStatusCodeFromErrorCode(errorCode)
    this.metadata = { ...metadata, layer, application, method, error }
    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * 공통 팩토리 메서드 - 하위 클래스에서 사용할 기본 구현
   */

  // 일반 에러를 BaseError로 변환하는 메서드
  static createFrom<T extends NewError>(constructor: new (params: ErrorParams) => T, params: ErrorParams): T {
    return new constructor(params as ErrorParams)
  }

  // 400 Bad Request
  static badRequest<T extends NewError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.BAD_REQUEST,
      statusCode: 400,
    })
  }

  // 401 Unauthorized
  static unauthorized<T extends NewError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.UNAUTHORIZED,
      statusCode: 401,
    })
  }

  // 403 Forbidden
  static forbidden<T extends NewError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.FORBIDDEN,
      statusCode: 403,
    })
  }

  // 404 Not Found
  static notFound<T extends NewError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.NOT_FOUND,
      statusCode: 404,
    })
  }

  // 500 Internal Server Error
  static internalError<T extends NewError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.INTERNAL_ERROR,
      statusCode: 500,
    })
  }

  // 400 Validation Error
  static validationError<T extends NewError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.VALIDATION_ERROR,
      statusCode: 400,
    })
  }

  // 422 Business Rule Violation
  static businessRuleViolation<T extends NewError>(
    constructor: new (params: ErrorParams) => T,
    params: Omit<ErrorParams, "errorCode" | "statusCode">
  ): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.BUSINESS_RULE_VIOLATION,
      statusCode: 422,
    })
  }

  // 500 Database Error
  static databaseError<T extends NewError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.DATABASE_ERROR,
      statusCode: 500,
    })
  }

  // 일반 에러 객체를 특정 계층 에러로 변환
  static fromError<T extends NewError>(constructor: new (params: ErrorParams) => T, error: unknown, params: ErrorParams): T {
    const errorMessage = errorToString(error)
    return new constructor({
      ...params,
      message: params.message || errorMessage,
      error,
      errorCode: params.errorCode || ErrorCode.UNKNOWN_ERROR,
      statusCode: error instanceof NewError ? error.statusCode : 500,
    })
  }
}
