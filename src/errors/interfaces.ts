import { ErrorChainItem, ErrorCode, ErrorLayer, UnifiedError } from "."

/**
 * 에러 체인 항목 생성 함수
 */
export function createErrorChainItem({
  layer,
  method,
  request,
  errorCode,
  statusCode,
  message,
  details,
}: {
  layer: ErrorLayer
  method: string
  request?: string
  errorCode: ErrorCode
  statusCode: number
  message: string
  details?: Record<string, any>
}): ErrorChainItem {
  return {
    layer,
    method,
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
    // errorId: '',
    timestamp: new Date().toISOString(),
    statusCode,
    clientMessage,
    clientErrorCode,
    errorChain,
  }
}
