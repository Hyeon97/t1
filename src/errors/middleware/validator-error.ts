import { ControllerError } from "../controller/controller-error"
import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"

export enum ValidatorErrorCode {
  VALIDATION_FAILED = "MID_VAL_001",
  TOKEN_REQUIRED = "MID_VAL_002",
  TOKEN_INVALID = "MID_VAL_003",
  TOKEN_EXPIRED = "MID_VAL_004",
  PERMISSION_DENIED = "MID_VAL_005"
}

export interface ValidatorErrorParams {
  functionName: string
  message: string
  cause?: unknown
  metadata?: Record<string, any>
}

export class ValidatorError extends Error {
  public readonly errorChain: ErrorChainItem[]
  public readonly statusCode: number

  constructor({
    errorCode,
    functionName,
    message,
    cause,
    statusCode = 400,
    metadata
  }: ValidatorErrorParams & {
    errorCode: ValidatorErrorCode,
    statusCode?: number
  }) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode

    // 상세 정보 구성
    const details: Record<string, any> = {
      middlewareType: "validator" as ErrorLayer,
      ...metadata
    }

    // 에러 체인 생성
    this.errorChain = [
      createErrorChainItem({
        layer: "middleware" as ErrorLayer, // "validator"에서 "middleware"로 변경
        functionName,
        errorCode,
        statusCode,
        message,
        details
      })
    ]

    // 원인 에러의 체인 병합 (있다면)
    if (cause instanceof ControllerError) {
      this.errorChain.push(...cause.errorChain)
    } else if (cause instanceof ValidatorError) {
      this.errorChain.push(...cause.errorChain)
    }

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }

  // Validator 에러 팩토리 메서드들
  static validationFailed({
    functionName,
    message,
    cause,
    metadata
  }: ValidatorErrorParams): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.VALIDATION_FAILED,
      functionName,
      message,
      cause,
      statusCode: 400,
      metadata
    })
  }

  static tokenRequired({
    functionName,
    message = "인증 토큰이 필요합니다",
    cause,
    metadata
  }: Partial<ValidatorErrorParams> & { functionName: string }): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.TOKEN_REQUIRED,
      functionName,
      message,
      cause,
      statusCode: 401,
      metadata
    })
  }

  static tokenInvalid({
    functionName,
    message = "유효하지 않은 토큰입니다",
    cause,
    metadata
  }: Partial<ValidatorErrorParams> & { functionName: string }): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.TOKEN_INVALID,
      functionName,
      message,
      cause,
      statusCode: 401,
      metadata
    })
  }

  static tokenExpired({
    functionName,
    message = "만료된 토큰입니다",
    cause,
    metadata
  }: Partial<ValidatorErrorParams> & { functionName: string }): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.TOKEN_EXPIRED,
      functionName,
      message,
      cause,
      statusCode: 401,
      metadata
    })
  }

  static permissionDenied({
    functionName,
    message = "접근 권한이 없습니다",
    cause,
    metadata
  }: Partial<ValidatorErrorParams> & { functionName: string }): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.PERMISSION_DENIED,
      functionName,
      message,
      cause,
      statusCode: 403,
      metadata
    })
  }

  // 일반 에러를 Validator 에러로 변환
  static fromError({ error, functionName, message }: { error: unknown, functionName: string, message: string }): ValidatorError {
    // 일반 에러 타입인 경우 ValidatorError로 변환
    // 다른 타입인 경우 ValidatorError로 간주 ( 사전 필터링에서 다른 타입은 못들어 온다고 간주 )
    if (error instanceof Error) {
      const msg = message || error instanceof Error ? error.message : String(error)
      return ValidatorError.validationFailed({
        functionName,
        message: msg || `Validator 작업 중 예상치 못한 오류 발생: ${message}`,
        cause: error,
      })
    }
    else {
      // 이미 ValidatorError인 경우 
      return error as ValidatorError
    }
  }
}