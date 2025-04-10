import { ErrorChainItem, ErrorLayer } from "../error-types"
import { createErrorChainItem } from "../interfaces"


export interface BaseErrorOptions {
  errorCode: string
  layer: ErrorLayer
  functionName: string
  message: string
  cause?: unknown
  metadata?: Record<string, any>
  statusCode: number  // 항상 HTTP 상태 코드를 필수로 받음
}

/**
 * 모든 계층별 에러의 기본 클래스
 * 에러 체인 관리를 위한 공통 기능 제공
 */
export class BaseError extends Error {
  public readonly errorChain: ErrorChainItem[]
  public readonly statusCode: number  // HTTP 상태 코드 추가

  constructor({
    errorCode,
    layer,
    functionName,
    message,
    cause,
    metadata,
    statusCode
  }: BaseErrorOptions) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode

    // 상세 정보 구성
    const details: Record<string, any> = { ...metadata }

    // 에러 체인 생성
    this.errorChain = [
      createErrorChainItem({
        layer,
        functionName,
        errorCode,
        statusCode,  // 에러 체인에도 상태 코드 포함
        message,
        details
      })
    ]

    // 원인 에러의 체인 병합
    if (cause instanceof BaseError) {
      this.errorChain.push(...cause.errorChain)
    } else if (cause instanceof Error && 'errorChain' in cause && Array.isArray((cause as any).errorChain)) {
      this.errorChain.push(...(cause as any).errorChain)
    }

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * 일반 에러를 현재 에러 타입으로 변환하는 추상 메서드
   */
  static fromError(params: { error: unknown; functionName: string; message: string }): BaseError {
    throw new Error("이 메서드는 하위 클래스에서 구현해야 합니다")
  }
}