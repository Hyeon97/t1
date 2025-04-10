import { BaseError } from "../base/base-error"
import { ErrorLayer } from "../interfaces"

export enum UtilityErrorCode {
  // 공통 에러 코드 정의
  DATA_PROCESSING = "UTIL_001",
  VALIDATION = "UTIL_002",
  BUSINESS_RULE = "UTIL_003",
  RESOURCE_NOT_FOUND = "UTIL_004",
  DEPENDENCY = "UTIL_005",
  TRANSACTION = "UTIL_006",
  UNAUTHORIZED = "UTIL_007",
  BAD_REQUEST = "UTIL_008",

  // 환경 관련 에러 코드
  ENV_CONFIG_ERROR = "UTIL_ENV_001",
  ENV_FILE_NOT_FOUND = "UTIL_ENV_002",
  ENV_PARSE_ERROR = "UTIL_ENV_003",

  // JWT 관련 에러 코드
  JWT_SIGN_ERROR = "UTIL_JWT_001",
  JWT_VERIFY_ERROR = "UTIL_JWT_002",
  JWT_EXPIRED = "UTIL_JWT_003",
  JWT_INVALID = "UTIL_JWT_004",

  // 기타 유틸리티 에러 코드 (추후 확장 가능)
  FILE_OPERATION_ERROR = "UTIL_FILE_001",
  NETWORK_ERROR = "UTIL_NET_001",
  PARSING_ERROR = "UTIL_PARSE_001",
}

export interface UtilityErrorParams {
  functionName: string
  message: string
  statusCode?: number
  cause?: unknown
  metadata?: Record<string, any>
}

export class UtilityError extends BaseError {
  constructor({ errorCode, functionName, message, cause, metadata, statusCode }: UtilityErrorParams & { errorCode: UtilityErrorCode }) {
    super({
      errorCode,
      statusCode: 500,
      layer: "utility" as ErrorLayer, // utility 레이어용
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // 권한 없음
  static unauthorizedError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.UNAUTHORIZED,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  /**
   * 사용자의 잘못된 요청 처리
   * 유효하지 않은 파라미터, 지원되지 않는 작업 등
   */
  static badRequestError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.BAD_REQUEST,
      functionName,
      message: message || "잘못된 요청(값)입니다",
      cause,
      metadata,
    })
  }

  static validationError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static businessRuleError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.BUSINESS_RULE,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static resourceNotFoundError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.RESOURCE_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dependencyError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.DEPENDENCY,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dataProcessingError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.DATA_PROCESSING,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static transactionError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.TRANSACTION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // 환경 설정 관련 에러
  static envConfigError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.ENV_CONFIG_ERROR,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static envFileNotFoundError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.ENV_FILE_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // JWT 관련 에러
  static jwtSignError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.JWT_SIGN_ERROR,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static jwtVerifyError({ functionName, message, cause, metadata }: UtilityErrorParams): UtilityError {
    return new UtilityError({
      errorCode: UtilityErrorCode.JWT_VERIFY_ERROR,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // 일반 에러를 Utility 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): UtilityError {
    if (error instanceof Error) {
      const msg = message || (error instanceof Error ? error.message : String(error))
      return UtilityError.dataProcessingError({
        functionName,
        message: msg || `Utility 작업 중 예상치 못한 오류 발생: ${message}`,
        cause: error,
      })
    } else {
      return UtilityError.dataProcessingError({
        functionName,
        message: `Utility 작업 중 예상치 못한 오류 발생: ${message}`,
        cause: error,
      })
    }
  }
}
