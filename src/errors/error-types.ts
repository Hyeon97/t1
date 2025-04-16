/**
 * 통합된 에러 타입 정의
 * 모든 에러 관련 타입을 한 곳에서 관리합니다.
 */

// 통합된 에러 코드 (계층 구분 없이 공통으로 사용)
export enum ErrorCode {
  // 클라이언트 에러 (400-499)
  BAD_REQUEST = "BAD_REQUEST",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  CONFLICT = "CONFLICT",
  RESOURCE_EXISTS = "RESOURCE_EXISTS",

  // 서버 에러 (500-599)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // 비즈니스 로직 관련 에러
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
  DATA_PROCESSING_ERROR = "DATA_PROCESSING_ERROR",
  DATA_DELETION_ERROR = "DATA_DELETION_ERROR",

  // 데이터베이스 관련 에러
  DATABASE_ERROR = "DATABASE_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  QUERY_ERROR = "QUERY_ERROR",
  DATA_INTEGRITY_ERROR = "DATA_INTEGRITY_ERROR",
  DATA_MAPPING_ERROR = "DATA_MAPPING_ERROR",
  TRANSACTION_ERROR = "TRANSACTION_ERROR",

  // 외부 의존성 관련 에러
  DEPENDENCY_ERROR = "DEPENDENCY_ERROR",

  // 환경 관련 에러
  ENV_CONFIG_ERROR = "ENV_CONFIG_ERROR",
  ENV_FILE_NOT_FOUND = "ENV_FILE_NOT_FOUND",
  ENV_PARSE_ERROR = "ENV_PARSE_ERROR",

  // JWT 관련 에러
  JWT_SIGN_ERROR = "JWT_SIGN_ERROR",
  JWT_VERIFY_ERROR = "JWT_VERIFY_ERROR",
  JWT_EXPIRED = "JWT_EXPIRED",
  JWT_INVALID = "JWT_INVALID",

  // 기타 유틸리티 에러
  FILE_OPERATION_ERROR = "FILE_OPERATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  PARSING_ERROR = "PARSING_ERROR",

  // 기타
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// 에러 발생 계층 타입
export enum ErrorLayer {
  DATABASE = "database",
  REPOSITORY = "repository",
  SERVICE = "service",
  CONTROLLER = "controller",
  MIDDLEWARE = "middleware",
  UTILITY = "utility",
  UNKNOWN = "unknown",
}

// 기본 에러 파라미터 인터페이스
export interface ErrorParams {
  errorCode: ErrorCode // 서버 내부 에러 식별 코드
  layer: ErrorLayer //  에러가 발생한 계층
  method: string // 에러가 발생한 함수 이름
  message: string //  에러 메세지
  statusCode?: number //  HTTP 상태 코드, API 응답에 사용됨
  cause?: unknown //  에러 원인 ( 에러 원본 )
  metadata?: Record<string, any> // 에러와 관련된 추가 정보 객체
  request?: string // Database 에러에서 해당 쿼리 요청 함수 이름
  query?: string // Database 에러 발생시 실행한 쿼리
  params?: any[] // Database 에러 발생시 실행한 파라미터
}

// 에러 응답 인터페이스
export interface ErrorResponse {
  success: boolean
  error: {
    code: string
    message: string
    details?: any
    stack?: string
  }
  timestamp: string
  debug?: any
}

// 요청 정보 인터페이스
export interface RequestInfo {
  method: string
  url: string
  ip: string
  userId: string
}

// 에러 체인 항목 인터페이스
export interface ErrorChainItem {
  layer: ErrorLayer
  method: string
  request?: string
  errorCode: ErrorCode
  statusCode: number
  message: string
  details?: Record<string, any>
}

// 통합 에러 객체 인터페이스
export interface UnifiedError {
  timestamp: string
  statusCode: number
  clientMessage: string
  clientErrorCode: ErrorCode
  errorChain: ErrorChainItem[]
}

// API 에러 옵션 (레거시 호환성)
export interface ErrorOptions {
  name?: string
  statusCode: number
  message?: string
  errorCode: ErrorCode
  details?: any
}

export interface ErrorIOptions {
  message: string
  details?: any
}
