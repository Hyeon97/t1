////////////////////////////////////
//  에러 코드와 HTTP 상태 코드 매핑  //
//////////////////////////////////// 

import { ErrorCode } from "./error-types"

/**
 * 에러 코드에 해당하는 HTTP 상태 코드를 반환
 */
export function getStatusCodeFromErrorCode(errorCode: ErrorCode): number {
  const statusCodeMap: Record<ErrorCode, number> = {
    // 클라이언트 에러 (400-499)
    BAD_REQUEST: 400,
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    RESOURCE_EXISTS: 409,

    // 서버 에러 (500-599)
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,

    // 비즈니스 로직 관련 에러
    BUSINESS_RULE_VIOLATION: 422, // Unprocessable Entity
    DATA_PROCESSING_ERROR: 422,

    // 데이터베이스 관련 에러
    DATABASE_ERROR: 500,
    CONNECTION_ERROR: 500,
    QUERY_ERROR: 500,
    DATA_INTEGRITY_ERROR: 500,
    DATA_MAPPING_ERROR: 500,
    TRANSACTION_ERROR: 500,

    // 외부 의존성 관련 에러
    DEPENDENCY_ERROR: 502, // Bad Gateway

    // 환경 관련 에러
    ENV_CONFIG_ERROR: 500,
    ENV_FILE_NOT_FOUND: 500,
    ENV_PARSE_ERROR: 500,

    // JWT 관련 에러
    JWT_SIGN_ERROR: 500,
    JWT_VERIFY_ERROR: 401,
    JWT_EXPIRED: 401,
    JWT_INVALID: 401,

    // 기타 유틸리티 에러
    FILE_OPERATION_ERROR: 500,
    NETWORK_ERROR: 500,
    PARSING_ERROR: 400,

    // 기타
    UNKNOWN_ERROR: 500
  }

  return statusCodeMap[errorCode] || 500
}

/**
 * 사용자 친화적인 에러 메시지 가져오기
 */
export function getUserFriendlyMessage(errorCode: ErrorCode): string {
  const messageMap: Record<ErrorCode, string> = {
    // 클라이언트 에러
    BAD_REQUEST: "잘못된 요청입니다",
    VALIDATION_ERROR: "입력값이 유효하지 않습니다",
    UNAUTHORIZED: "인증이 필요합니다",
    FORBIDDEN: "접근 권한이 없습니다",
    NOT_FOUND: "요청한 리소스를 찾을 수 없습니다",
    METHOD_NOT_ALLOWED: "허용되지 않은 메서드입니다",
    CONFLICT: "리소스 충돌이 발생했습니다",
    RESOURCE_EXISTS: "이미 존재하는 리소스입니다",

    // 비즈니스 로직 관련 에러
    BUSINESS_RULE_VIOLATION: "비즈니스 규칙에 위배됩니다",
    DATA_PROCESSING_ERROR: "데이터 처리 중 오류가 발생했습니다",

    // 데이터베이스 관련 에러
    DATABASE_ERROR: "데이터베이스 오류가 발생했습니다",
    CONNECTION_ERROR: "데이터베이스 연결 오류가 발생했습니다",
    QUERY_ERROR: "쿼리 실행 중 오류가 발생했습니다",
    DATA_INTEGRITY_ERROR: "데이터 무결성 오류가 발생했습니다",
    DATA_MAPPING_ERROR: "데이터 매핑 오류가 발생했습니다",
    TRANSACTION_ERROR: "트랜잭션 처리 중 오류가 발생했습니다",

    // 외부 의존성 관련 에러
    DEPENDENCY_ERROR: "외부 서비스 연결 오류가 발생했습니다",

    // 환경 관련 에러
    ENV_CONFIG_ERROR: "환경 설정 오류가 발생했습니다",
    ENV_FILE_NOT_FOUND: "환경 설정 파일을 찾을 수 없습니다",
    ENV_PARSE_ERROR: "환경 설정 파싱 오류가 발생했습니다",

    // JWT 관련 에러
    JWT_SIGN_ERROR: "토큰 생성 중 오류가 발생했습니다",
    JWT_VERIFY_ERROR: "토큰 검증에 실패했습니다",
    JWT_EXPIRED: "만료된 토큰입니다",
    JWT_INVALID: "유효하지 않은 토큰입니다",

    // 기타 유틸리티 에러
    FILE_OPERATION_ERROR: "파일 작업 중 오류가 발생했습니다",
    NETWORK_ERROR: "네트워크 오류가 발생했습니다",
    PARSING_ERROR: "데이터 파싱 중 오류가 발생했습니다",

    // 서버 에러
    INTERNAL_ERROR: "서버 내부 오류가 발생했습니다",
    SERVICE_UNAVAILABLE: "서비스를 일시적으로 사용할 수 없습니다",

    // 기타
    UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다"
  }

  return messageMap[errorCode] || "요청을 처리하는 중 오류가 발생했습니다"
}