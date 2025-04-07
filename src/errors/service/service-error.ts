import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"
import { RepositoryError, RepositoryErrorCode } from "../repository/repository-error"

export enum ServiceErrorCode {
  UNAUTHORIZED = "SRV_000",
  VALIDATION = "SRV_001",
  BUSINESS_RULE = "SRV_002",
  RESOURCE_NOT_FOUND = "SRV_003",
  DEPENDENCY = "SRV_004",
  DATA_PROCESSING = "SRV_005",
  TRANSACTION = "SRV_006",
}

export interface ServiceErrorParams {
  functionName: string
  message: string
  cause?: unknown
  metadata?: Record<string, any>
}

export class ServiceError extends Error {
  public readonly errorChain: ErrorChainItem[]

  constructor({ errorCode, functionName, message, cause, metadata }: ServiceErrorParams & { errorCode: ServiceErrorCode }) {
    super(message)
    this.name = this.constructor.name

    // 상세 정보 구성
    const details: Record<string, any> = { ...metadata }

    // 에러 체인 생성
    this.errorChain = [
      createErrorChainItem({
        layer: "service" as ErrorLayer,
        functionName,
        errorCode,
        message,
        details,
      }),
    ]

    // 원인 에러의 체인 병합
    if (cause instanceof RepositoryError) {
      this.errorChain.push(...cause.errorChain)
    } else if (cause instanceof ServiceError) {
      this.errorChain.push(...cause.errorChain)
    }
    // else if (cause instanceof Error) {
    //   details.originalError = {
    //     name: cause.name,
    //     message: cause.message,
    //   }
    // }

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }

  //  권한 없음
  static unauthorizedError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.UNAUTHORIZED,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static validationError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static businessRuleError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.BUSINESS_RULE,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static resourceNotFoundError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.RESOURCE_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dependencyError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.DEPENDENCY,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dataProcessingError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.DATA_PROCESSING,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static transactionError({ functionName, message, cause, metadata }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.TRANSACTION,
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

  // 일반 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): ServiceError {
    // 일반 에러 타입인 경우 ServiceError로 변환
    // 다른 타입인 경우 ServiceError로 간주 ( 사전 필터링에서 다른 타입은 못들어 온다고 간주 )
    if (error instanceof Error) {
      const msg = message || error instanceof Error ? error.message : String(error)
      return ServiceError.dataProcessingError({
        functionName,
        message: msg || `Service 작업 중 예상치 못한 오류 발생: ${message}`,
        cause: error,
      })
    } else if (error instanceof RepositoryError) {
      return ServiceError.fromRepositoryError({ error, functionName })
    } else return error as ServiceError
  }
}
