import { errorToString } from "../../utils/error.utils"
import { BaseError } from "../base/base-error"
import { ControllerErrorCode, ControllerErrorParams, ServiceErrorCode, UtilityErrorCode } from "../error-types"
import { ServiceError } from "../service/service-error"
import { UtilityError } from "../utility/utility-error"

/**
 * 컨트롤러 계층의 에러를 처리하는 클래스
 */
export class ControllerError extends BaseError {
  constructor({
    errorCode,
    functionName,
    message,
    cause,
    metadata,
    statusCode = 500
  }: ControllerErrorParams & { errorCode: ControllerErrorCode }) {
    super({
      errorCode,
      layer: "controller",
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 500
    })
  }

  // 유효성 검증 오류
  static validationError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
    return new ControllerError({
      errorCode: ControllerErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      statusCode: 400,
      metadata
    })
  }

  // 인증 오류
  static authenticationError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
    return new ControllerError({
      errorCode: ControllerErrorCode.AUTHENTICATION,
      functionName,
      message,
      cause,
      statusCode: 401,
      metadata
    })
  }

  // 권한 오류
  static authorizationError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
    return new ControllerError({
      errorCode: ControllerErrorCode.AUTHORIZATION,
      functionName,
      message,
      cause,
      statusCode: 403,
      metadata
    })
  }

  // 리소스 찾기 실패
  static resourceNotFoundError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
    return new ControllerError({
      errorCode: ControllerErrorCode.RESOURCE_NOT_FOUND,
      functionName,
      message,
      cause,
      statusCode: 404,
      metadata
    })
  }

  // 잘못된 요청
  static badRequestError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
    return new ControllerError({
      errorCode: ControllerErrorCode.BAD_REQUEST,
      functionName,
      message,
      cause,
      statusCode: 400,
      metadata
    })
  }

  // 내부 서버 오류
  static internalServerError({ functionName, message, cause, metadata, statusCode = 500 }: ControllerErrorParams): ControllerError {
    return new ControllerError({
      errorCode: ControllerErrorCode.INTERNAL_SERVER,
      functionName,
      message,
      cause,
      statusCode,
      metadata
    })
  }

  // Service 에러를 Controller 에러로 변환하는 팩토리 메서드
  static fromServiceError({ error, functionName }: { error: ServiceError; functionName: string }): ControllerError {
    // Service 에러의 첫 번째 항목에서 정보 추출
    const svcErrorItem = error.errorChain[0]
    const errorCode = svcErrorItem.errorCode as ServiceErrorCode
    const statusCode = svcErrorItem.statusCode

    switch (errorCode) {
      case ServiceErrorCode.RESOURCE_NOT_FOUND:
        return ControllerError.resourceNotFoundError({
          functionName,
          message: `요청한 리소스를 찾을 수 없습니다`,
          cause: error
        })
      case ServiceErrorCode.VALIDATION:
        return ControllerError.validationError({
          functionName,
          message: `요청 데이터 유효성 검증 실패`,
          cause: error
        })
      case ServiceErrorCode.BUSINESS_RULE:
        return ControllerError.badRequestError({
          functionName,
          message: `비즈니스 규칙 위반`,
          cause: error
        })
      case ServiceErrorCode.UNAUTHORIZED:
        return ControllerError.authenticationError({
          functionName,
          message: `인증 실패`,
          cause: error
        })
      default:
        return ControllerError.internalServerError({
          functionName,
          message: `서버 내부 오류가 발생했습니다`,
          cause: error,
          metadata: { originalCode: errorCode },
          statusCode
        })
    }
  }

  // Utility 에러를 Controller 에러로 직접 변환하는 팩토리 메서드
  static fromUtilityError({ error, functionName }: { error: UtilityError; functionName: string }): ControllerError {
    // Utility 에러의 첫 번째 항목에서 정보 추출
    const utilErrorItem = error.errorChain[0]
    const errorCode = utilErrorItem.errorCode as UtilityErrorCode
    const statusCode = utilErrorItem.statusCode

    // JWT 관련 에러는 인증 에러로 처리
    if (errorCode.startsWith("UTIL_JWT")) {
      return ControllerError.authenticationError({
        functionName,
        message: `인증 필요: ${utilErrorItem.message}`,
        cause: error
      })
    }
    // 유효성 검증 관련 에러
    else if (errorCode === UtilityErrorCode.VALIDATION) {
      return ControllerError.validationError({
        functionName,
        message: utilErrorItem.message,
        cause: error
      })
    }
    // 리소스 찾기 관련 에러
    else if (errorCode === UtilityErrorCode.RESOURCE_NOT_FOUND) {
      return ControllerError.resourceNotFoundError({
        functionName,
        message: utilErrorItem.message,
        cause: error
      })
    }
    // 그 외 에러는 서버 내부 에러로 처리
    else {
      return ControllerError.internalServerError({
        functionName,
        message: `서버 내부 오류: ${utilErrorItem.message}`,
        cause: error,
        metadata: { originalCode: errorCode },
        statusCode
      })
    }
  }

  // 일반 에러를 Controller 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): ControllerError {
    if (error instanceof ServiceError) {
      return ControllerError.fromServiceError({ error, functionName })
    } else if (error instanceof UtilityError) {
      return ControllerError.fromUtilityError({ error, functionName })
    } else if (error instanceof ControllerError) {
      return error
    } else {
      const errorMsg = message || (error instanceof Error ? error.message : errorToString(error))

      return ControllerError.internalServerError({
        functionName,
        message: errorMsg || `요청 처리 중 예상치 못한 오류가 발생했습니다`,
        cause: error
      })
    }
  }
}