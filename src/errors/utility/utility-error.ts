import { errorToString } from "../../utils/error.utils"
import { BaseError } from "../base/base-error"
import { UtilityErrorCode, UtilityErrorParams } from "../error-types"

/**
 * 유틸리티 계층의 에러를 처리하는 클래스
 */
export class UtilityError extends BaseError {
  constructor({
    errorCode,
    functionName,
    message,
    cause,
    metadata,
    statusCode = 500
  }: UtilityErrorParams & { errorCode: UtilityErrorCode }) {
    super({
      errorCode,
      layer: "utility",
      functionName,
      message,
      cause,
      metadata,
      statusCode
    })
  }

  // 권한 없음
  static unauthorizedError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.UNAUTHORIZED,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 401
    })
  }

  // 잘못된 요청 처리
  static badRequestError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.BAD_REQUEST,
      functionName,
      message: message || "잘못된 요청(값)입니다",
      cause,
      metadata,
      statusCode: 400
    })
  }

  // 유효성 검증 오류
  static validationError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 400
    })
  }

  // 비즈니스 규칙 오류
  static businessRuleError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.BUSINESS_RULE,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 422
    })
  }

  // 리소스 찾기 실패
  static resourceNotFoundError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.RESOURCE_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 404
    })
  }

  // 의존성 오류
  static dependencyError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.DEPENDENCY,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 502
    })
  }

  // 데이터 처리 오류
  static dataProcessingError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.DATA_PROCESSING,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 500
    })
  }

  // 트랜잭션 오류
  static transactionError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.TRANSACTION,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 500
    })
  }

  // 환경 설정 관련 에러
  static envConfigError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.ENV_CONFIG_ERROR,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 500
    })
  }

  static envFileNotFoundError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.ENV_FILE_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 500
    })
  }

  // JWT 관련 에러
  static jwtSignError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.JWT_SIGN_ERROR,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 500
    })
  }

  static jwtVerifyError({ functionName, message, cause, metadata, statusCode }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.JWT_VERIFY_ERROR,
      functionName,
      message,
      cause,
      metadata,
      statusCode: 401
    })
  }

  // 일반 에러를 Utility 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): UtilityError {
    if (error instanceof UtilityError) {
      return error
    }

    const errorMsg = message || (error instanceof Error ? error.message : errorToString(error))

    return UtilityError.dataProcessingError({
      functionName,
      message: errorMsg || `Utility 작업 중 예상치 못한 오류 발생`,
      cause: error
    })
  }
}