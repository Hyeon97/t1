import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"
import { RepositoryError, RepositoryErrorCode } from "../repository/repository-error"

export enum ServiceErrorCode {
  VALIDATION = "SRV_001",
  BUSINESS_RULE = "SRV_002",
  RESOURCE_NOT_FOUND = "SRV_003",
  DEPENDENCY = "SRV_004",
  DATA_PROCESSING = "SRV_005",
  TRANSACTION = "SRV_006"
}

export interface ServiceErrorParams {
  functionName: string
  message: string
  cause?: unknown
  entityName?: string
  operationName?: string
  metadata?: Record<string, any>
}

export class ServiceError extends Error {
  public readonly errorChain: ErrorChainItem[]

  constructor({
    errorCode,
    functionName,
    message,
    cause,
    entityName,
    operationName,
    metadata
  }: ServiceErrorParams & { errorCode: ServiceErrorCode }) {
    super(message)
    this.name = this.constructor.name

    // 상세 정보 구성
    const details: Record<string, any> = { ...metadata }
    if (entityName) details.entityName = entityName
    if (operationName) details.operationName = operationName

    // 에러 체인 생성
    this.errorChain = [
      createErrorChainItem({
        layer: "service" as ErrorLayer,
        entityName: entityName || "Service",
        functionName,
        errorCode,
        message,
        details
      })
    ]

    // 원인 에러의 체인 병합
    if (cause instanceof RepositoryError) {
      this.errorChain.push(...cause.errorChain)
    } else if (cause instanceof ServiceError) {
      this.errorChain.push(...cause.errorChain)
    } else if (cause instanceof Error) {
      details.originalError = {
        name: cause.name,
        message: cause.message
      }
    }

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }

  // 서비스 에러 팩토리 메서드들
  static validationError({
    functionName,
    message,
    cause,
    entityName,
    operationName,
    metadata
  }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      entityName,
      operationName,
      metadata
    })
  }

  static businessRuleError({
    functionName,
    message,
    cause,
    entityName,
    operationName,
    metadata
  }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.BUSINESS_RULE,
      functionName,
      message,
      cause,
      entityName,
      operationName,
      metadata
    })
  }

  static resourceNotFoundError({
    functionName,
    message,
    cause,
    entityName,
    operationName,
    metadata
  }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.RESOURCE_NOT_FOUND,
      functionName,
      message,
      cause,
      entityName,
      operationName,
      metadata
    })
  }

  static dependencyError({
    functionName,
    message,
    cause,
    entityName,
    operationName,
    metadata
  }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.DEPENDENCY,
      functionName,
      message,
      cause,
      entityName,
      operationName,
      metadata
    })
  }

  static dataProcessingError({
    functionName,
    message,
    cause,
    entityName,
    operationName,
    metadata
  }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.DATA_PROCESSING,
      functionName,
      message,
      cause,
      entityName,
      operationName,
      metadata
    })
  }

  static transactionError({
    functionName,
    message,
    cause,
    entityName,
    operationName,
    metadata
  }: ServiceErrorParams): ServiceError {
    return new ServiceError({
      errorCode: ServiceErrorCode.TRANSACTION,
      functionName,
      message,
      cause,
      entityName,
      operationName,
      metadata
    })
  }

  // Repository 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromRepositoryError({
    error,
    functionName,
    operationName
  }: {
    error: RepositoryError
    functionName: string
    operationName?: string
  }): ServiceError {
    // Repository 에러의 첫 번째 항목에서 정보 추출
    const repoErrorItem = error.errorChain[0]
    const entityName = repoErrorItem.details?.entityName

    let serviceError: ServiceError

    switch (repoErrorItem.errorCode) {
      case RepositoryErrorCode.ENTITY_NOT_FOUND:
        serviceError = ServiceError.resourceNotFoundError({
          functionName,
          message: `리소스를 찾을 수 없습니다${entityName ? `: ${entityName}` : ''}`,
          cause: error,
          entityName,
          operationName,
          metadata: { identifier: repoErrorItem.details?.identifier }
        })
        break
      case RepositoryErrorCode.VALIDATION:
        serviceError = ServiceError.validationError({
          functionName,
          message: `데이터 유효성 검증 실패${entityName ? `(${entityName})` : ''}`,
          cause: error,
          entityName,
          operationName
        })
        break
      default:
        serviceError = ServiceError.dependencyError({
          functionName,
          message: `Repository 작업 중 오류 발생${entityName ? `(${entityName})` : ''}`,
          cause: error,
          entityName,
          operationName,
          metadata: { originalCode: repoErrorItem.errorCode }
        })
    }

    return serviceError
  }

  // 일반 에러를 Service 에러로 변환하는 팩토리 메서드
  static fromError({
    error,
    functionName,
    operationName,
    entityName
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
      operationName
    })
  }
}