import { BaseError } from "../base/base-error"
import { ErrorCode, ErrorLayer, ErrorParams } from "../error-types"

/**
 * 유틸리티 계층의 에러를 처리하는 클래스
 */
export class UtilityError extends BaseError {
  constructor(params: ErrorParams) {
    super({
      ...params,
      layer: ErrorLayer.UTILITY,
    })
  }

  // 일반 에러를 Utility 에러로 변환하는 팩토리 메서드
  static fromError<T extends BaseError = UtilityError>(
    error: unknown,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "cause"> & {
      functionName: string
      message: string
      layer?: ErrorLayer
    }
  ): T {
    return BaseError.fromError(UtilityError as any, error, {
      ...params,
      layer: ErrorLayer.UTILITY,
    }) as unknown as T
  }

  // 공통 에러 타입들 - BaseError의 팩토리 메서드 활용

  // 잘못된 요청
  static badRequest<T extends BaseError = UtilityError>(
    constructor: new (params: ErrorParams) => T = UtilityError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.badRequest(constructor, {
      ...params,
      layer: ErrorLayer.UTILITY,
    })
  }

  // 권한 없음
  static unauthorized<T extends BaseError = UtilityError>(
    constructor: new (params: ErrorParams) => T = UtilityError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.unauthorized(constructor, {
      ...params,
      layer: ErrorLayer.UTILITY,
    })
  }

  // 유효성 검증 오류
  static validationError<T extends BaseError = UtilityError>(
    constructor: new (params: ErrorParams) => T = UtilityError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.validationError(constructor, {
      ...params,
      layer: ErrorLayer.UTILITY,
    })
  }

  // 비즈니스 규칙 오류
  static businessRuleError<T extends BaseError = UtilityError>(
    constructor: new (params: ErrorParams) => T = UtilityError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.businessRuleViolation(constructor, {
      ...params,
      layer: ErrorLayer.UTILITY,
    })
  }

  // 리소스 찾기 실패
  static resourceNotFoundError<T extends BaseError = UtilityError>(
    constructor: new (params: ErrorParams) => T = UtilityError as any,
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): T {
    return BaseError.notFound(constructor, {
      ...params,
      layer: ErrorLayer.UTILITY,
    })
  }

  // 의존성 오류
  static dependencyError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.DEPENDENCY_ERROR,
      statusCode: 502,
    })
  }

  // 데이터 처리 오류
  static dataProcessingError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.DATA_PROCESSING_ERROR,
      statusCode: 500,
    })
  }

  // 트랜잭션 오류
  static transactionError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.TRANSACTION_ERROR,
      statusCode: 500,
    })
  }

  // 환경 설정 관련 에러
  // 환경 설정 오류
  static envConfigError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.ENV_CONFIG_ERROR,
      statusCode: 500,
    })
  }

  // 환경 설정 파일 찾기 실패
  static envFileNotFoundError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.ENV_FILE_NOT_FOUND,
      statusCode: 500,
    })
  }

  // JWT 관련 에러
  // JWT 서명 오류
  static jwtSignError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.JWT_SIGN_ERROR,
      statusCode: 500,
    })
  }

  // JWT 검증 오류
  static jwtVerifyError(
    params: Omit<ErrorParams, "statusCode" | "layer"> = {
      functionName: "",
      message: "",
      errorCode: ErrorCode.JWT_VERIFY_ERROR,
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: params.errorCode || ErrorCode.JWT_VERIFY_ERROR,
      statusCode: 401,
    })
  }

  // JWT 만료
  static jwtExpired(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.JWT_EXPIRED,
      statusCode: 401,
    })
  }

  // JWT 유효하지 않음
  static jwtInvalid(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.JWT_INVALID,
      statusCode: 401,
    })
  }

  // 기타 에러
  // 파싱 오류
  static parsingError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.PARSING_ERROR,
      statusCode: 400,
    })
  }

  // 파일 관련 작업 오류
  static fileOperationError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      functionName: "",
      message: "",
    }
  ): UtilityError {
    return BaseError.createFrom(UtilityError, {
      ...params,
      layer: ErrorLayer.UTILITY,
      errorCode: ErrorCode.FILE_OPERATION_ERROR,
      statusCode: 500,
    })
  }
}
