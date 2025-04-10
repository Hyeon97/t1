////////////////////////////////////////////
//  집중화된 에러 타입 정의                  //
//  모든 에러 관련 타입을 한 곳에서 관리합니다  //
////////////////////////////////////////////

// 공통 API 에러 코드 (클라이언트에게 노출되는 코드)
export enum ErrorCode {
  // 클라이언트 에러 (400-499)
  CONFLICT = "CONFLICT",
  RESOURCE_EXISTS = "RESOURCE_EXISTS",

  // 서버 에러 (500-599)
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  // 일반 에러
  INTERNAL_ERROR = "INTERNAL_ERROR",

  // 인증/인가 관련 에러
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",

  // 요청 관련 에러
  BAD_REQUEST = "BAD_REQUEST",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",

  // 비즈니스 로직 관련 에러
  BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION",
  DATA_PROCESSING_ERROR = "DATA_PROCESSING_ERROR",

  // 데이터베이스 관련 에러
  DATABASE_ERROR = "DATABASE_ERROR",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  QUERY_ERROR = "QUERY_ERROR",
  DATA_INTEGRITY_ERROR = "DATA_INTEGRITY_ERROR",
  DATA_MAPPING_ERROR = "DATA_MAPPING_ERROR",
  TRANSACTION_ERROR = "TRANSACTION_ERROR",

  // 외부 의존성 관련 에러
  DEPENDENCY_ERROR = "DEPENDENCY_ERROR",

  // 기타
  UNKNOWN_ERROR = "UNKNOWN_ERROR"
}

// 컨트롤러 계층 에러 코드
export enum ControllerErrorCode {
  VALIDATION = "CTRL_001",
  AUTHENTICATION = "CTRL_002",
  AUTHORIZATION = "CTRL_003",
  RESOURCE_NOT_FOUND = "CTRL_004",
  BAD_REQUEST = "CTRL_005",
  INTERNAL_SERVER = "CTRL_006"
}

// 서비스 계층 에러 코드
export enum ServiceErrorCode {
  UNAUTHORIZED = "SRV_000",
  VALIDATION = "SRV_001",
  BUSINESS_RULE = "SRV_002",
  RESOURCE_NOT_FOUND = "SRV_003",
  DEPENDENCY = "SRV_004",
  DATA_PROCESSING = "SRV_005",
  TRANSACTION = "SRV_006",
  BAD_REQUEST = "SRV_007"
}

// 레포지토리 계층 에러 코드
export enum RepositoryErrorCode {
  QUERY_EXECUTION = "REPO_001",
  ENTITY_NOT_FOUND = "REPO_002",
  DATA_MAPPING = "REPO_003",
  VALIDATION = "REPO_004",
  DATABASE = "REPO_005"
}

// 데이터베이스 계층 에러 코드
export enum DatabaseErrorCode {
  CONNECTION_ERROR = "DB_001",
  QUERY_ERROR = "DB_002",
  DATA_INTEGRITY_ERROR = "DB_003",
  RECORD_NOT_FOUND = "DB_004",
  TRANSACTION_ERROR = "DB_005"
}

// 밸리데이터 미들웨어 에러 코드
export enum ValidatorErrorCode {
  VALIDATION_FAILED = "MID_VAL_001",
  TOKEN_REQUIRED = "MID_VAL_002",
  TOKEN_INVALID = "MID_VAL_003",
  TOKEN_EXPIRED = "MID_VAL_004",
  PERMISSION_DENIED = "MID_VAL_005"
}

// 유틸리티 계층 에러 코드
export enum UtilityErrorCode {
  // 공통 에러 코드 정의
  DATA_PROCESSING = "UTIL_001",
  VALIDATION = "UTIL_002",
  BUSINESS_RULE = "UTIL_003",
  RESOURCE_NOT_FOUND = "UTIL_004",
  DEPENDENCY = "UTIL_005",
  TRANSACTION = "UTIL_006",
  UNAUTHORIZED = "UTIL_007",
  BAD_REQUEST = "UTIL_008",

  // 환경 관련 에러 코드
  ENV_CONFIG_ERROR = "UTIL_ENV_001",
  ENV_FILE_NOT_FOUND = "UTIL_ENV_002",
  ENV_PARSE_ERROR = "UTIL_ENV_003",

  // JWT 관련 에러 코드
  JWT_SIGN_ERROR = "UTIL_JWT_001",
  JWT_VERIFY_ERROR = "UTIL_JWT_002",
  JWT_EXPIRED = "UTIL_JWT_003",
  JWT_INVALID = "UTIL_JWT_004",

  // 기타 유틸리티 에러 코드 (추후 확장 가능)
  FILE_OPERATION_ERROR = "UTIL_FILE_001",
  NETWORK_ERROR = "UTIL_NET_001",
  PARSING_ERROR = "UTIL_PARSE_001"
}

// 모든 에러 코드 통합 타입
export type AllErrorCodes =
  | ErrorCode
  | ControllerErrorCode
  | ServiceErrorCode
  | RepositoryErrorCode
  | DatabaseErrorCode
  | ValidatorErrorCode
  | UtilityErrorCode

// 에러 발생 계층 타입
export type ErrorLayer = "database" | "repository" | "service" | "controller" | "middleware" | "utility" | "unknown"

// 기본 에러 파라미터 인터페이스
export interface BaseErrorParams {
  functionName: string
  message: string
  statusCode?: number
  cause?: unknown
  metadata?: Record<string, any>
}

// 컨트롤러 에러 파라미터
export interface ControllerErrorParams extends BaseErrorParams { }

// 서비스 에러 파라미터
export interface ServiceErrorParams extends BaseErrorParams { }

// 레포지토리 에러 파라미터
export interface RepositoryErrorParams extends BaseErrorParams { }

// 데이터베이스 에러 파라미터
export interface DatabaseErrorParams extends BaseErrorParams {
  request?: string
  query?: string
  params?: any[]
}

// 밸리데이터 에러 파라미터 
export interface ValidatorErrorParams extends BaseErrorParams { }

// 유틸리티 에러 파라미터
export interface UtilityErrorParams extends BaseErrorParams { }

// API 에러 옵션 (기존 에러 시스템과의 호환성 유지)
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
  functionName: string
  request?: string
  errorCode: string
  statusCode?: number
  message: string
  details?: Record<string, any>
}

// 통합 에러 객체 인터페이스
export interface UnifiedError {
  // errorId: string  // 고유 에러 ID (UUID 형식)
  timestamp: string // ISO 형식 타임스탬프
  statusCode: number // HTTP 상태 코드
  clientMessage: string // 클라이언트에게 보여줄 메시지
  clientErrorCode: ErrorCode // API 에러 코드
  errorChain?: ErrorChainItem[] // 에러 발생 체인
}