import { ErrorCode } from "./error-codes"

export interface ErrorIOptions {
  message: string
  details?: any
}

export interface ErrorOptions {
  name?: string
  statusCode: number
  message?: string //  외부 출력용 메시지
  logMessage?: string[] //  내부 로깅용 메시지
  errorCode: ErrorCode
  details?: any
}

export interface ErrorResponse {
  success: boolean
  error: {
    code: string
    message: string
    details?: any
    stack?: string
  }
  timestamp: string
}

export interface RequestInfo {
  method: string
  url: string
  ip: string
  userId: string
}

/**
 * 에러 발생 계층 타입
 */
export type ErrorLayer = "database" | "repository" | "service" | "controller" | "middleware" | "unknown"

/**
 * 에러 체인 항목 인터페이스
 */
export interface ErrorChainItem {
  layer: ErrorLayer
  functionName: string
  request?: string
  errorCode: string
  message: string
  details?: Record<string, any>
}

/**
 * 통합 에러 객체 인터페이스
 */
export interface UnifiedError {
  // errorId: string  // 고유 에러 ID (UUID 형식)
  timestamp: string // ISO 형식 타임스탬프
  statusCode: number // HTTP 상태 코드
  clientMessage: string // 클라이언트에게 보여줄 메시지
  clientErrorCode: ErrorCode // API 에러 코드
  errorChain?: ErrorChainItem[] // 에러 발생 체인
}

/**
 * 에러 체인 항목 생성 함수
 */
export function createErrorChainItem({
  layer,
  functionName,
  request,
  errorCode,
  message,
  details,
}: {
  layer: ErrorLayer
  functionName: string
  request?: string
  errorCode: string
  message: string
  details?: Record<string, any>
}): ErrorChainItem {
  return {
    layer,
    functionName,
    request,
    errorCode,
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
