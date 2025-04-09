import { DatabaseError, DatabaseErrorCode } from "../database/database-error"
import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"

export enum RepositoryErrorCode {
  QUERY_EXECUTION = "REPO_001",
  ENTITY_NOT_FOUND = "REPO_002",
  DATA_MAPPING = "REPO_003",
  VALIDATION = "REPO_004",
  DATABASE = "REPO_005",
}

export interface RepositoryErrorParams {
  functionName: string
  message: string
  cause?: unknown
  metadata?: Record<string, any>
}

export class RepositoryError extends Error {
  public readonly errorChain: ErrorChainItem[]

  constructor({ errorCode, functionName, message, cause, metadata }: RepositoryErrorParams & { errorCode: RepositoryErrorCode }) {
    super(message)
    this.name = this.constructor.name

    // 상세 정보 구성
    const details: Record<string, any> = { ...metadata }

    // 에러 체인 생성
    this.errorChain = [
      createErrorChainItem({
        layer: "repository" as ErrorLayer,
        functionName,
        errorCode,
        message,
        details,
      }),
    ]

    // 원인 에러의 체인 병합
    if (cause instanceof DatabaseError) {
      this.errorChain.push(...cause.errorChain)
    } else if (cause instanceof RepositoryError) {
      this.errorChain.push(...cause.errorChain)
    } else if (cause instanceof Error) {
      details.originalError = {
        name: cause.name,
        message: cause.message,
      }
    }

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }

  // 팩토리 메서드들
  static queryExecutionError({ functionName, message, cause, metadata }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.QUERY_EXECUTION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static NotFoundError({ functionName, message, cause, metadata }: RepositoryErrorParams): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.ENTITY_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dataMappingError({ functionName, message, cause, metadata }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.DATA_MAPPING,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static validationError({ functionName, message, cause, metadata }: Omit<RepositoryErrorParams, "identifier">): RepositoryError {
    return new RepositoryError({
      errorCode: RepositoryErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // 데이터베이스 에러를 Repository 에러로 변환하는 팩토리 메서드
  static fromDatabaseError({ error, functionName }: { error: DatabaseError; functionName: string }): RepositoryError {
    let repositoryError: RepositoryError

    switch (error.errorChain[0].errorCode) {
      case DatabaseErrorCode.DATA_INTEGRITY_ERROR:
        repositoryError = RepositoryError.validationError({
          functionName,
          message: `데이터 무결성 오류`,
          cause: error,
        })
        break
      default:
        repositoryError = RepositoryError.queryExecutionError({
          functionName,
          message: `데이터베이스 작업 중 오류 발생`,
          cause: error,
          metadata: { originalCode: error.errorChain[0].errorCode },
        })
    }

    return repositoryError
  }

  // 일반 에러를 Repository 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): RepositoryError {
    // 일반 에러 타입인 경우 RepositoryError로 변환
    // 다른 타입인 경우 RepositoryError로 간주 ( 사전 필터링에서 다른 타입은 못들어 온다고 간주 )
    if (error instanceof Error) {
      const msg = message || error instanceof Error ? error.message : String(error)

      return RepositoryError.queryExecutionError({
        functionName,
        message: msg || `Repository 작업 중 예상치 못한 오류 발생: ${message}`,
        cause: error,
      })
    } else return error as RepositoryError
    // if (error instanceof DatabaseError) { return this.fromDatabaseError({ error, functionName,  }) }
    // if (error instanceof RepositoryError) { return error }
  }
}
