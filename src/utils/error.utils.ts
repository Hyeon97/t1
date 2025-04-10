import { ErrorChainItem, ErrorCode, ErrorLayer, UnifiedError } from "../errors/error-types"
import { getUserFriendlyMessage } from "../errors/status-code-mapper"

/**
 * 에러 체인 항목 생성 함수
 */
export function createErrorChainItem({
  layer,
  functionName,
  request,
  errorCode,
  statusCode,
  message,
  details,
}: {
  layer: ErrorLayer
  functionName: string
  request?: string
  errorCode: string
  statusCode?: number
  message: string
  details?: Record<string, any>
}): ErrorChainItem {
  return {
    layer,
    functionName,
    request,
    errorCode,
    statusCode,
    message,
    details,
  }
}

/**
 * 통합 에러 생성 함수
 */
export function createUnifiedError({
  statusCode,
  clientMessage,
  clientErrorCode,
  errorChain,
}: {
  statusCode: number
  clientMessage: string
  clientErrorCode: ErrorCode
  errorChain: ErrorChainItem[]
}): UnifiedError {
  return {
    timestamp: new Date().toISOString(),
    statusCode,
    clientMessage,
    clientErrorCode,
    errorChain,
  }
}

/**
 * 에러 체인으로부터 사용자 친화적인 메시지 추출
 * @param errorChain 에러 체인
 * @returns 사용자 친화적인 메시지
 */
export function getClientMessageFromErrorChain(errorChain: ErrorChainItem[]): string {
  if (!errorChain || errorChain.length === 0) {
    return "알 수 없는 오류가 발생했습니다"
  }

  // 가장 상위 계층의 에러 코드로부터 메시지 추출
  const topError = errorChain[0]
  return getUserFriendlyMessage(topError.errorCode)
}

/**
 * 타입 감지 유틸리티 함수들
 */

/**
 * 객체가 에러 체인을 가지고 있는지 확인
 */
export function hasErrorChain(obj: unknown): obj is { errorChain: ErrorChainItem[] } {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'errorChain' in obj &&
    Array.isArray((obj as any).errorChain)
  )
}

/**
 * 에러 메시지 포맷팅 함수
 * @param layer 에러 발생 계층
 * @param functionName 에러 발생 함수
 * @param message 에러 메시지
 */
export function formatErrorMessage(layer: ErrorLayer, functionName: string, message: string): string {
  return `[${layer.toUpperCase()}] ${functionName}(): ${message}`
}

/**
 * 에러를 문자열로 변환
 * @param error 에러 객체
 */
export function errorToString(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}