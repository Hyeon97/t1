import { BaseError } from "../base/base-error"
import { ErrorLayer } from "../interfaces"
import { RepositoryError, RepositoryErrorCode } from "../repository/repository-error"
import { UtilityError, UtilityErrorCode } from "../utility/utility-error"

export enum ServiceErrorCode {
  UNAUTHORIZED = "SRV_000",
  VALIDATION = "SRV_001",
  BUSINESS_RULE = "SRV_002",
  RESOURCE_NOT_FOUND = "SRV_003",
  DEPENDENCY = "SRV_004",
  DATA_PROCESSING = "SRV_005",
  TRANSACTION = "SRV_006",
  BAD_REQUEST = "SRV_007",
}

export interface ServiceErrorParams {
  functionName: string
  message: string
  statusCode?: number
  cause?: unknown
  metadata?: Record<string, any>
}

export class ServiceError extends BaseError {
  constructor({ errorCode, functionName, message, cause, metadata, statusCode, }: ServiceErrorParams & { errorCode: ServiceErrorCode }) {
    super({
      errorCode,
      statusCode: 500,
      layer: "service" as ErrorLayer,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  //  권한 없음
  static unauthorizedError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.UNAUTHORIZED,
      statusCode: 401,
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
  static badRequestError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.BAD_REQUEST,
      statusCode: 400,
      functionName,
      message: message || "잘못된 요청(값)입니다",
      cause,
      metadata,
    })
  }

  static validationError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.VALIDATION,
      statusCode: 400,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static businessRuleError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.BUSINESS_RULE,
      statusCode: 422,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static resourceNotFoundError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.RESOURCE_NOT_FOUND,
      statusCode: 404,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dependencyError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.DEPENDENCY,
      statusCode: 502,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dataProcessingError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.DATA_PROCESSING,
      statusCode: 500,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static transactionError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.TRANSACTION,
      statusCode: 500,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // Repository 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromRepositoryError({ error, functionName }: { error: RepositoryError; functionName: string }): ServiceError {
    // Repository 에러의 첫 번째 항목에서 정보 추출
    const repoErrorItem = error.errorChain[0]

    let serviceError: ServiceError

    switch (repoErrorItem.errorCode) {
      case RepositoryErrorCode.ENTITY_NOT_FOUND:
        serviceError = ServiceError.resourceNotFoundError({
          functionName,
          message: `리소스를 찾을 수 없습니다`,
          cause: error,
        })
        break
      case RepositoryErrorCode.VALIDATION:
        serviceError = ServiceError.validationError({
          functionName,
          message: `데이터 유효성 검증 실패`,
          cause: error,
        })
        break
      default:
        serviceError = ServiceError.dependencyError({
          functionName,
          message: `Repository 작업 중 오류 발생`,
          cause: error,
          metadata: { originalCode: repoErrorItem.errorCode },
        })
    }

    return serviceError
  }

  // Utility 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromUtilityError({ error, functionName }: { error: UtilityError; functionName: string }): ServiceError {
    // Utility 에러의 첫 번째 항목에서 정보 추출
    const utilErrorItem = error.errorChain[0]
    const errorCode = utilErrorItem.errorCode

    let serviceError: ServiceError

    // 에러 유형에 따라 적절한 Service 에러 생성
    if (errorCode.startsWith("UTIL_JWT")) {
      serviceError = ServiceError.unauthorizedError({
        functionName,
        message: `인증 중 오류 발생: ${utilErrorItem.message}`,
        cause: error,
      })
    } else if (errorCode === UtilityErrorCode.VALIDATION) {
      serviceError = ServiceError.validationError({
        functionName,
        message: utilErrorItem.message,
        cause: error,
      })
    } else if (errorCode === UtilityErrorCode.RESOURCE_NOT_FOUND) {
      serviceError = ServiceError.resourceNotFoundError({
        functionName,
        message: utilErrorItem.message,
        cause: error,
      })
    } else {
      serviceError = ServiceError.dataProcessingError({
        functionName,
        message: `Utility 작업 중 오류 발생: ${utilErrorItem.message}`,
        cause: error,
        metadata: { originalCode: errorCode },
      })
    }

    return serviceError
  }

  // 일반 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): ServiceError {
    // 다른 에러 유형 처리
    if (error instanceof RepositoryError) {
      return ServiceError.fromRepositoryError({ error, functionName })
    } else if (error instanceof UtilityError) {
      return ServiceError.fromUtilityError({ error, functionName })
    } else if (error instanceof ServiceError) {
      return error
    } else if (error instanceof Error) {
      const msg = message || error.message
      return ServiceError.dataProcessingError({
        functionName,
        message: msg || `Service 작업 중 예상치 못한 오류 발생`,
        cause: error,
      })
    } else {
      return ServiceError.dataProcessingError({
        functionName,
        message: message || `Service 작업 중 예상치 못한 오류 발생`,
        cause: error,
      })
    }
  }
}
