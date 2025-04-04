import { DatabaseError, DatabaseErrorCode } from "../database/database-error"
import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"


export enum RepositoryErrorCode {
  QUERY_EXECUTION = "REPO_001",
  ENTITY_NOT_FOUND = "REPO_002",
  DATA_MAPPING = "REPO_003",
  VALIDATION = "REPO_004",
  DATABASE = "REPO_005"
}

export interface RepositoryErrorParams {
  functionName: string
  message: string
  cause?: unknown
  entityName?: string
  identifier?: any
  metadata?: Record<string, any>
}

export class RepositoryError extends Error {
  public readonly errorChain: ErrorChainItem[]

  constructor({
    errorCode,
    functionName,
    message,
    cause,
    entityName,
    identifier,
    metadata
  }: RepositoryErrorParams & { errorCode: RepositoryErrorCode }) {
    super(message)
    this.name = this.constructor.name

    // 상세 정보 구성
    const details: Record<string, any> = { ...metadata }
    if (entityName) details.entityName = entityName
    if (identifier !== undefined) details.identifier = identifier

    // 에러 체인 생성
    this.errorChain = [
      createErrorChainItem({
        layer: "repository" as ErrorLayer,
        entityName: entityName || "Repository",
        functionName,
        errorCode,
        message,
        details
      })
    ]

    // 원인 에러의 체인 병합
    if (cause instanceof DatabaseError) {
      this.errorChain.push(...cause.errorChain)
    } else if (cause instanceof RepositoryError) {
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

  // 팩토리 메서드들
  static queryExecutionError({
    functionName,
    message,
    cause,
    entityName,
    metadata
  }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.QUERY_EXECUTION,
      functionName,
      message,
      cause,
      entityName,
      metadata
    })
  }

  static entityNotFoundError({
    functionName,
    message,
    cause,
    entityName,
    identifier,
    metadata
  }: RepositoryErrorParams): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.ENTITY_NOT_FOUND,
      functionName,
      message,
      cause,
      entityName,
      identifier,
      metadata
    })
  }

  static dataMappingError({
    functionName,
    message,
    cause,
    entityName,
    metadata
  }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.DATA_MAPPING,
      functionName,
      message,
      cause,
      entityName,
      metadata
    })
  }

  static validationError({
    functionName,
    message,
    cause,
    entityName,
    metadata
  }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      entityName,
      metadata
    })
  }

  // 데이터베이스 에러를 Repository 에러로 변환하는 팩토리 메서드
  static fromDatabaseError({
    error,
    functionName,
    entityName
  }: {
    error: DatabaseError
    functionName: string
    entityName?: string
  }): RepositoryError {
    let repositoryError: RepositoryError

    switch (error.errorChain[0].errorCode) {
      case DatabaseErrorCode.RECORD_NOT_FOUND:
        repositoryError = RepositoryError.entityNotFoundError({
          functionName,
          message: `엔티티를 찾을 수 없습니다${entityName ? `: ${entityName}` : ''}`,
          cause: error,
          entityName
        })
        break
      case DatabaseErrorCode.DATA_INTEGRITY_ERROR:
        repositoryError = RepositoryError.validationError({
          functionName,
          message: `데이터 무결성 오류${entityName ? `(${entityName})` : ''}`,
          cause: error,
          entityName
        })
        break
      default:
        repositoryError = RepositoryError.queryExecutionError({
          functionName,
          message: `데이터베이스 작업 중 오류 발생${entityName ? `(${entityName})` : ''}`,
          cause: error,
          entityName,
          metadata: { originalCode: error.errorChain[0].errorCode }
        })
    }

    return repositoryError
  }

  // 일반 에러를 Repository 에러로 변환하는 팩토리 메서드
  static fromError({
    error,
    functionName,
    entityName
  }: {
    error: unknown
    functionName: string
    entityName?: string
  }): RepositoryError {
    if (error instanceof DatabaseError) {
      return this.fromDatabaseError({ error, functionName, entityName })
    }

    if (error instanceof RepositoryError) {
      return error
    }

    const message = error instanceof Error ? error.message : String(error)

    return RepositoryError.queryExecutionError({
      functionName,
      message: `Repository 작업 중 예상치 못한 오류 발생: ${message}`,
      cause: error,
      entityName
    })
  }
}
