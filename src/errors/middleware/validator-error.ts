import { errorToString } from "../../utils/error.utils"
import { BaseError } from "../base/base-error"
import { ControllerError } from "../controller/controller-error"
import { ValidatorErrorCode, ValidatorErrorParams } from "../error-types"

/**
 * 검증 미들웨어 계층의 에러를 처리하는 클래스
 */
export class ValidatorError extends BaseError {
  constructor({
    errorCode,
    functionName,
    message,
    cause,
    metadata,
    statusCode = 400 // 기본적으로 클라이언트 오류
  }: ValidatorErrorParams & { errorCode: ValidatorErrorCode }) {
    // 메타데이터 설정
    const enhancedMetadata = {
      middlewareType: "validator",
      ...metadata
    }

    super({
      errorCode,
      layer: "middleware",
      functionName,
      message,
      cause,
      metadata: enhancedMetadata,
      statusCode
    })
  }

  // 유효성 검증 실패
  static validationFailed({
    functionName,
    message,
    cause,
    metadata,
    statusCode
  }: ValidatorErrorParams): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.VALIDATION_FAILED,
      functionName,
      message,
      cause,
      statusCode: statusCode || 400,
      metadata
    })
  }

  // 토큰 필요
  static tokenRequired({
    functionName,
    message = "인증 토큰이 필요합니다",
    cause,
    metadata,
    statusCode
  }: Partial<ValidatorErrorParams> & { functionName: string }): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.TOKEN_REQUIRED,
      functionName,
      message,
      cause,
      statusCode: statusCode || 401,
      metadata
    })
  }

  // 유효하지 않은 토큰
  static tokenInvalid({
    functionName,
    message = "유효하지 않은 토큰입니다",
    cause,
    metadata,
    statusCode
  }: Partial<ValidatorErrorParams> & { functionName: string }): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.TOKEN_INVALID,
      functionName,
      message,
      cause,
      statusCode: statusCode || 401,
      metadata
    })
  }

  // 만료된 토큰
  static tokenExpired({
    functionName,
    message = "만료된 토큰입니다",
    cause,
    metadata,
    statusCode
  }: Partial<ValidatorErrorParams> & { functionName: string }): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.TOKEN_EXPIRED,
      functionName,
      message,
      cause,
      statusCode: statusCode || 401,
      metadata
    })
  }

  // 권한 없음
  static permissionDenied({
    functionName,
    message = "접근 권한이 없습니다",
    cause,
    metadata,
    statusCode
  }: Partial<ValidatorErrorParams> & { functionName: string }): ValidatorError {
    return new ValidatorError({
      errorCode: ValidatorErrorCode.PERMISSION_DENIED,
      functionName,
      message,
      cause,
      statusCode: statusCode || 403,
      metadata
    })
  }

  // 일반 에러를 Validator 에러로 변환
  static fromError({ error, functionName, message }: { error: unknown, functionName: string, message: string }): ValidatorError {
    if (error instanceof ValidatorError) {
      return error
    } else if (error instanceof ControllerError) {
      return ValidatorError.validationFailed({
        functionName,
        message: error.message,
        cause: error,
        statusCode: error.statusCode
      })
    } else {
      const errorMsg = message || (error instanceof Error ? error.message : errorToString(error))

      return ValidatorError.validationFailed({
        functionName,
        message: errorMsg || `Validator 작업 중 예상치 못한 오류 발생`,
        cause: error
      })
    }
  }
}