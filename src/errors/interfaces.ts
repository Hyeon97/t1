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