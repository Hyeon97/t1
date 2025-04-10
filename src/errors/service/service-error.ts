import { errorToString } from "../../utils/error.utils"
import { BaseError } from "../base/base-error"
import { RepositoryErrorCode, ServiceErrorCode, ServiceErrorParams, UtilityErrorCode } from "../error-types"
import { RepositoryError } from "../repository/repository-error"

import { UtilityError } from "../utility/utility-error"

/**
 * 서비스 계층의 에러를 처리하는 클래스
 */
export class ServiceError extends BaseError {
  constructor({
    errorCode,
    functionName,
    message,
    cause,
    metadata,
    statusCode = 500
  }: ServiceErrorParams & { errorCode: ServiceErrorCode }) {
    super({
      errorCode,
      layer: "service",
      functionName,
      message,
      cause,
      metadata,
      statusCode
    })
  }

  // 권한 없음
  static unauthorizedError({ functionName, message, cause, metadata, statusCode }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.UNAUTHORIZED,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 401
    })
  }

  // 잘못된 요청 처리
  static badRequestError({ functionName, message, cause, metadata, statusCode }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.BAD_REQUEST,
      functionName,
      message: message || "잘못된 요청(값)입니다",
      cause,
      metadata,
      statusCode: statusCode || 400
    })
  }

  // 유효성 검증 오류
  static validationError({ functionName, message, cause, metadata, statusCode }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 400
    })
  }

  // 비즈니스 규칙 오류
  static businessRuleError({ functionName, message, cause, metadata, statusCode }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.BUSINESS_RULE,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 422
    })
  }

  // 리소스 찾기 실패
  static resourceNotFoundError({ functionName, message, cause, metadata, statusCode }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.RESOURCE_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 404
    })
  }

  // 의존성 오류
  static dependencyError({ functionName, message, cause, metadata, statusCode }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.DEPENDENCY,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 502
    })
  }

  // 데이터 처리 오류
  static dataProcessingError({ functionName, message, cause, metadata, statusCode }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.DATA_PROCESSING,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 500
    })
  }

  // 트랜잭션 오류
  static transactionError({ functionName, message, cause, metadata, statusCode }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.TRANSACTION,
      functionName,
      message,
      cause,
      metadata,
      statusCode: statusCode || 500
    })
  }

  // Repository 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromRepositoryError({ error, functionName }: { error: RepositoryError; functionName: string }): ServiceError {
    // Repository 에러의 첫 번째 항목에서 정보 추출
    const repoErrorItem = error.errorChain[0]
    const errorCode = repoErrorItem.errorCode as RepositoryErrorCode
    const statusCode = repoErrorItem.statusCode

    switch (errorCode) {
      case RepositoryErrorCode.ENTITY_NOT_FOUND:
        return ServiceError.resourceNotFoundError({
          functionName,
          message: `리소스를 찾을 수 없습니다`,
          cause: error,
          statusCode
        })
      case RepositoryErrorCode.VALIDATION:
        return ServiceError.validationError({
          functionName,
          message: `데이터 유효성 검증 실패`,
          cause: error,
          statusCode
        })
      default:
        return ServiceError.dependencyError({
          functionName,
          message: `Repository 작업 중 오류 발생`,
          cause: error,
          metadata: { originalCode: errorCode },
          statusCode
        })
    }
  }

  // Utility 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromUtilityError({ error, functionName }: { error: UtilityError; functionName: string }): ServiceError {
    // Utility 에러의 첫 번째 항목에서 정보 추출
    const utilErrorItem = error.errorChain[0]
    const errorCode = utilErrorItem.errorCode as UtilityErrorCode
    const statusCode = utilErrorItem.statusCode

    // 에러 유형에 따라 적절한 Service 에러 생성
    if (errorCode.startsWith("UTIL_JWT")) {
      return ServiceError.unauthorizedError({
        functionName,
        message: `인증 중 오류 발생: ${utilErrorItem.message}`,
        cause: error,
        statusCode
      })
    } else if (errorCode === UtilityErrorCode.VALIDATION) {
      return ServiceError.validationError({
        functionName,
        message: utilErrorItem.message,
        cause: error,
        statusCode
      })
    } else if (errorCode === UtilityErrorCode.RESOURCE_NOT_FOUND) {
      return ServiceError.resourceNotFoundError({
        functionName,
        message: utilErrorItem.message,
        cause: error,
        statusCode
      })
    } else {
      return ServiceError.dataProcessingError({
        functionName,
        message: `Utility 작업 중 오류 발생: ${utilErrorItem.message}`,
        cause: error,
        metadata: { originalCode: errorCode },
        statusCode
      })
    }
  }

  // 일반 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): ServiceError {
    if (error instanceof RepositoryError) {
      return ServiceError.fromRepositoryError({ error, functionName })
    } else if (error instanceof UtilityError) {
      return ServiceError.fromUtilityError({ error, functionName })
    } else if (error instanceof ServiceError) {
      return error
    } else {
      const errorMsg = message || (error instanceof Error ? error.message : errorToString(error))
      return ServiceError.dataProcessingError({
        functionName,
        message: errorMsg || `Service 작업 중 예상치 못한 오류 발생`,
        cause: error
      })
    }
  }
}