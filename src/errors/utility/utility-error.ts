import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"

export enum UtilErrorCode {
  DATA_PROCESSING = "UTIL_000",
}

export interface UtilErrorParams {
  functionName: string
  message: string
  cause?: unknown
  metadata?: Record<string, any>
}

export class UtilError extends Error {
  public readonly errorChain: ErrorChainItem[]

  constructor({ errorCode, functionName, message, cause, metadata }: UtilErrorParams & { errorCode: UtilErrorCode }) {
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
    } else if (cause instanceof UtilError) {
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
  static unauthorizedError({ functionName, message, cause, metadata }: UtilErrorParams): UtilError {
    return new UtilError({
      errorCode: UtilErrorCode.UNAUTHORIZED,
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
  static badRequestError({ functionName, message, cause, metadata }: UtilErrorParams): UtilError {
    return new UtilError({
      errorCode: UtilErrorCode.BAD_REQUEST,
      functionName,
      message: message || "잘못된 요청(값)입니다",
      cause,
      metadata,
    })
  }

  static validationError({ functionName, message, cause, metadata }: UtilErrorParams): UtilError {
    return new UtilError({
      errorCode: UtilErrorCode.VALIDATION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static businessRuleError({ functionName, message, cause, metadata }: UtilErrorParams): UtilError {
    return new UtilError({
      errorCode: UtilErrorCode.BUSINESS_RULE,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static resourceNotFoundError({ functionName, message, cause, metadata }: UtilErrorParams): UtilError {
    return new UtilError({
      errorCode: UtilErrorCode.RESOURCE_NOT_FOUND,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dependencyError({ functionName, message, cause, metadata }: UtilErrorParams): UtilError {
    return new UtilError({
      errorCode: UtilErrorCode.DEPENDENCY,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static dataProcessingError({ functionName, message, cause, metadata }: UtilErrorParams): UtilError {
    return new UtilError({
      errorCode: UtilErrorCode.DATA_PROCESSING,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  static transactionError({ functionName, message, cause, metadata }: UtilErrorParams): UtilError {
    return new UtilError({
      errorCode: UtilErrorCode.TRANSACTION,
      functionName,
      message,
      cause,
      metadata,
    })
  }

  // Repository 에러를 Util 에러로 변환하는 팩토리 메서드
  static fromRepositoryError({ error, functionName }: { error: RepositoryError; functionName: string }): UtilError {
    // Repository 에러의 첫 번째 항목에서 정보 추출
    const repoErrorItem = error.errorChain[0]

    let serviceError: UtilError

    switch (repoErrorItem.errorCode) {
      case RepositoryErrorCode.ENTITY_NOT_FOUND:
        serviceError = UtilError.resourceNotFoundError({
          functionName,
          message: `리소스를 찾을 수 없습니다`,
          cause: error,
        })
        break
      case RepositoryErrorCode.VALIDATION:
        serviceError = UtilError.validationError({
          functionName,
          message: `데이터 유효성 검증 실패`,
          cause: error,
        })
        break
      default:
        serviceError = UtilError.dependencyError({
          functionName,
          message: `Repository 작업 중 오류 발생`,
          cause: error,
          metadata: { originalCode: repoErrorItem.errorCode },
        })
    }

    return serviceError
  }

  // 일반 에러를 Util 에러로 변환하는 팩토리 메서드
  static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): UtilError {
    // 일반 에러 타입인 경우 UtilError로 변환
    // 다른 타입인 경우 UtilError로 간주 ( 사전 필터링에서 다른 타입은 못들어 온다고 간주 )
    if (error instanceof Error) {
      const msg = message || error instanceof Error ? error.message : String(error)
      return UtilError.dataProcessingError({
        functionName,
        message: msg || `Util 작업 중 예상치 못한 오류 발생: ${message}`,
        cause: error,
      })
    } else if (error instanceof RepositoryError) {
      return UtilError.fromRepositoryError({ error, functionName })
    } else return error as UtilError
  }
}
