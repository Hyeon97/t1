import { BaseError, ErrorDetails } from "../base/base-error"
import { RepositoryError, RepositoryErrorCode } from "../repository/repository-error"

export enum ServiceErrorCode {
  VALIDATION = "SRV_001",
  BUSINESS_RULE = "SRV_002",
  RESOURCE_NOT_FOUND = "SRV_003",
  DEPENDENCY = "SRV_004",
  DATA_PROCESSING = "SRV_005",
  TRANSACTION = "SRV_006",
}

export interface ServiceErrorDetails extends ErrorDetails {
  code: ServiceErrorCode
  entityName?: string
  operationName?: string
}

export class ServiceError extends BaseError {
  public readonly code: ServiceErrorCode
  public readonly entityName?: string
  public readonly operationName?: string

  constructor({ functionName, message, code, cause, entityName, operationName, metadata }: ServiceErrorDetails) {
    super({ functionName, message, cause, metadata })
    this.code = code
    this.entityName = entityName
    this.operationName = operationName
  }

  // 서비스 에러 팩토리 메서드들
  static validationError({ functionName, message, cause, entityName, operationName, metadata }: Omit<ServiceErrorDetails, "code">): ServiceError {
    return new ServiceError({
      functionName,
      message,
      code: ServiceErrorCode.VALIDATION,
      cause,
      entityName,
      operationName,
      metadata,
    })
  }

  static businessRuleError({ functionName, message, cause, entityName, operationName, metadata }: Omit<ServiceErrorDetails, "code">): ServiceError {
    return new ServiceError({
      functionName,
      message,
      code: ServiceErrorCode.BUSINESS_RULE,
      cause,
      entityName,
      operationName,
      metadata,
    })
  }

  static resourceNotFoundError({
    functionName,
    message,
    cause,
    entityName,
    operationName,
    metadata,
  }: Omit<ServiceErrorDetails, "code">): ServiceError {
    return new ServiceError({
      functionName,
      message,
      code: ServiceErrorCode.RESOURCE_NOT_FOUND,
      cause,
      entityName,
      operationName,
      metadata,
    })
  }

  static dependencyError({ functionName, message, cause, entityName, operationName, metadata }: Omit<ServiceErrorDetails, "code">): ServiceError {
    return new ServiceError({
      functionName,
      message,
      code: ServiceErrorCode.DEPENDENCY,
      cause,
      entityName,
      operationName,
      metadata,
    })
  }

  static dataProcessingError({ functionName, message, cause, entityName, operationName, metadata }: Omit<ServiceErrorDetails, "code">): ServiceError {
    return new ServiceError({
      functionName,
      message,
      code: ServiceErrorCode.DATA_PROCESSING,
      cause,
      entityName,
      operationName,
      metadata,
    })
  }

  static transactionError({ functionName, message, cause, entityName, operationName, metadata }: Omit<ServiceErrorDetails, "code">): ServiceError {
    return new ServiceError({
      functionName,
      message,
      code: ServiceErrorCode.TRANSACTION,
      cause,
      entityName,
      operationName,
      metadata,
    })
  }

  // Repository 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromRepositoryError({
    error,
    functionName,
    operationName,
  }: {
    error: RepositoryError
    functionName: string
    operationName?: string
  }): ServiceError {
    let serviceError: ServiceError

    switch (error.code) {
      case RepositoryErrorCode.ENTITY_NOT_FOUND:
        serviceError = ServiceError.resourceNotFoundError({
          functionName,
          message: `리소스를 찾을 수 없습니다${error.entityName ? `: ${error.entityName}` : ""}`,
          cause: error,
          entityName: error.entityName,
          operationName,
          metadata: { identifier: error.identifier },
        })
        break
      case RepositoryErrorCode.VALIDATION:
        serviceError = ServiceError.validationError({
          functionName,
          message: `데이터 유효성 검증 실패${error.entityName ? `(${error.entityName})` : ""}`,
          cause: error,
          entityName: error.entityName,
          operationName,
        })
        break
      default:
        serviceError = ServiceError.dependencyError({
          functionName,
          message: `Repository 작업 중 오류 발생${error.entityName ? `(${error.entityName})` : ""}`,
          cause: error,
          entityName: error.entityName,
          operationName,
          metadata: { originalCode: error.code },
        })
    }

    return serviceError
  }

  // 일반 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromError({
    error,
    functionName,
    operationName,
    entityName,
  }: {
    error: unknown
    functionName: string
    operationName?: string
    entityName?: string
  }): ServiceError {
    if (error instanceof RepositoryError) {
      return ServiceError.fromRepositoryError({ error, functionName, operationName })
    }

    if (error instanceof ServiceError) {
      return error
    }

    const message = error instanceof Error ? error.message : String(error)

    return ServiceError.dataProcessingError({
      functionName,
      message: `서비스 작업 중 예상치 못한 오류 발생: ${message}`,
      cause: error,
      entityName,
      operationName,
    })
  }
}
