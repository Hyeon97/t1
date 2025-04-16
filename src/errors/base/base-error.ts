import { errorToString } from ".."
import { ErrorCode, ErrorLayer, ErrorParams } from "../error-types"
import { getStatusCodeFromErrorCode } from "../status-code-mapper"

/**
 * 모든 계층별 에러의 기본 클래스
 * 에러 체인 관리 및 공통 팩토리 메서드 제공
 */
export class BaseError extends Error {
  // public readonly errorChain: ErrorChainItem[]
  public readonly statusCode: number
  public readonly errorCode: ErrorCode
  // public readonly layer: ErrorLayer
  public readonly metadata?: Record<string, any>

  constructor({ errorCode, layer, method, message, cause, metadata, statusCode }: ErrorParams) {
    super(message)
    this.name = this.constructor.name
    this.errorCode = errorCode
    // this.layer = layer

    // 상태 코드가 명시적으로 제공되지 않은 경우 에러 코드에서 유추
    this.statusCode = statusCode || getStatusCodeFromErrorCode(errorCode)
    this.metadata = { ...metadata, method, layer, cause }

    // // 상세 정보 구성
    // const details: Record<string, any> = { ...metadata }


    // // 에러 체인 생성 (단순화: 원본 에러 + 현재 에러만 유지)
    // this.errorChain = [
    //   createErrorChainItem({
    //     layer,
    //     method,
    //     errorCode,
    //     statusCode: this.statusCode,
    //     message,
    //     details,
    //   }),
    // ]

    // // 원인 에러 정보 추가 (단순화: 원본 에러만 추가)
    // if (cause instanceof Error) {
    //   if (cause instanceof BaseError) {
    //     // 원인이 BaseError인 경우 원본 정보만 저장 (체인 누적 방지)
    //     this.errorChain.push(cause.errorChain[0])
    //   } else {
    //     // 일반 Error인 경우 기본 정보 저장
    //     details.originalError = {
    //       name: cause.name,
    //       message: cause.message,
    //     }
    //   }
    // }

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * 공통 팩토리 메서드 - 하위 클래스에서 사용할 기본 구현
   */

  // 일반 에러를 BaseError로 변환하는 메서드
  static createFrom<T extends BaseError>(
    constructor: new (params: ErrorParams) => T,
    params: Omit<ErrorParams, "errorCode" | "layer"> & {
      errorCode: ErrorCode
      layer: ErrorLayer
    }
  ): T {
    return new constructor(params as ErrorParams)
  }

  // 400 Bad Request
  static badRequest<T extends BaseError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.BAD_REQUEST,
      statusCode: 400,
    })
  }

  // 401 Unauthorized
  static unauthorized<T extends BaseError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.UNAUTHORIZED,
      statusCode: 401,
    })
  }

  // 403 Forbidden
  static forbidden<T extends BaseError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.FORBIDDEN,
      statusCode: 403,
    })
  }

  // 404 Not Found
  static notFound<T extends BaseError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.NOT_FOUND,
      statusCode: 404,
    })
  }

  // 500 Internal Server Error
  static internalError<T extends BaseError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.INTERNAL_ERROR,
      statusCode: 500,
    })
  }

  // 400 Validation Error
  static validationError<T extends BaseError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.VALIDATION_ERROR,
      statusCode: 400,
    })
  }

  // 422 Business Rule Violation
  static businessRuleViolation<T extends BaseError>(
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
  static databaseError<T extends BaseError>(constructor: new (params: ErrorParams) => T, params: Omit<ErrorParams, "errorCode" | "statusCode">): T {
    return new constructor({
      ...params,
      errorCode: ErrorCode.DATABASE_ERROR,
      statusCode: 500,
    })
  }

  // 일반 에러 객체를 특정 계층 에러로 변환
  static fromError<T extends BaseError>(
    constructor: new (params: ErrorParams) => T,
    error: unknown,
    params: Omit<ErrorParams, "statusCode">
  ): T {
    const errorMessage = errorToString(error)

    return new constructor({
      ...params,
      message: params.message || errorMessage,
      cause: params.cause || error,
      errorCode: params.errorCode || ErrorCode.UNKNOWN_ERROR,
      statusCode: error instanceof BaseError ? error.statusCode : 500,
    })
  }
}
