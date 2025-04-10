/**
 * 에러 코드와 HTTP 상태 코드 매핑
 */

import {
  AllErrorCodes,
  ControllerErrorCode,
  DatabaseErrorCode,
  ErrorCode,
  RepositoryErrorCode,
  ServiceErrorCode,
  UtilityErrorCode,
  ValidatorErrorCode
} from "./error-types"

/**
 * 에러 코드에 해당하는 HTTP 상태 코드를 반환
 */
export function getStatusCodeFromErrorCode(errorCode: AllErrorCodes): number {
  // 기본 API 에러 코드 매핑
  const apiErrorStatusCodeMap: Record<ErrorCode, number> = {
    // 클라이언트 에러
    BAD_REQUEST: 400,
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    RESOURCE_EXISTS: 409,

    // 비즈니스 로직 관련 에러
    BUSINESS_RULE_VIOLATION: 422, // Unprocessable Entity
    DATA_PROCESSING_ERROR: 422,

    // 서버 에러
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    DATABASE_ERROR: 500,
    CONNECTION_ERROR: 500,
    QUERY_ERROR: 500,
    DATA_INTEGRITY_ERROR: 500,
    DATA_MAPPING_ERROR: 500,
    TRANSACTION_ERROR: 500,
    DEPENDENCY_ERROR: 502, // Bad Gateway
    UNKNOWN_ERROR: 500
  }

  // Controller 에러 코드 매핑
  const controllerStatusCodeMap: Record<string, number> = {
    [ControllerErrorCode.VALIDATION]: 400,
    [ControllerErrorCode.AUTHENTICATION]: 401,
    [ControllerErrorCode.AUTHORIZATION]: 403,
    [ControllerErrorCode.RESOURCE_NOT_FOUND]: 404,
    [ControllerErrorCode.BAD_REQUEST]: 400,
    [ControllerErrorCode.INTERNAL_SERVER]: 500
  }

  // Service 에러 코드 매핑
  const serviceStatusCodeMap: Record<string, number> = {
    [ServiceErrorCode.UNAUTHORIZED]: 401,
    [ServiceErrorCode.VALIDATION]: 400,
    [ServiceErrorCode.BUSINESS_RULE]: 422, // Unprocessable Entity
    [ServiceErrorCode.RESOURCE_NOT_FOUND]: 404,
    [ServiceErrorCode.DEPENDENCY]: 502, // Bad Gateway
    [ServiceErrorCode.DATA_PROCESSING]: 500,
    [ServiceErrorCode.TRANSACTION]: 500,
    [ServiceErrorCode.BAD_REQUEST]: 400
  }

  // Repository 에러 코드 매핑
  const repositoryStatusCodeMap: Record<string, number> = {
    [RepositoryErrorCode.QUERY_EXECUTION]: 500,
    [RepositoryErrorCode.ENTITY_NOT_FOUND]: 404,
    [RepositoryErrorCode.DATA_MAPPING]: 500,
    [RepositoryErrorCode.VALIDATION]: 400,
    [RepositoryErrorCode.DATABASE]: 500
  }

  // Database 에러 코드 매핑
  const databaseStatusCodeMap: Record<string, number> = {
    [DatabaseErrorCode.CONNECTION_ERROR]: 500,
    [DatabaseErrorCode.QUERY_ERROR]: 500,
    [DatabaseErrorCode.DATA_INTEGRITY_ERROR]: 500,
    [DatabaseErrorCode.RECORD_NOT_FOUND]: 404,
    [DatabaseErrorCode.TRANSACTION_ERROR]: 500
  }

  // Validator 에러 코드 매핑
  const validatorStatusCodeMap: Record<string, number> = {
    [ValidatorErrorCode.VALIDATION_FAILED]: 400,
    [ValidatorErrorCode.TOKEN_REQUIRED]: 401,
    [ValidatorErrorCode.TOKEN_INVALID]: 401,
    [ValidatorErrorCode.TOKEN_EXPIRED]: 401,
    [ValidatorErrorCode.PERMISSION_DENIED]: 403
  }

  // Utility 에러 코드 매핑
  const utilityStatusCodeMap: Record<string, number> = {
    [UtilityErrorCode.DATA_PROCESSING]: 500,
    [UtilityErrorCode.VALIDATION]: 400,
    [UtilityErrorCode.BUSINESS_RULE]: 422,
    [UtilityErrorCode.RESOURCE_NOT_FOUND]: 404,
    [UtilityErrorCode.DEPENDENCY]: 502,
    [UtilityErrorCode.TRANSACTION]: 500,
    [UtilityErrorCode.UNAUTHORIZED]: 401,
    [UtilityErrorCode.BAD_REQUEST]: 400,

    // 환경 관련 에러
    [UtilityErrorCode.ENV_CONFIG_ERROR]: 500,
    [UtilityErrorCode.ENV_FILE_NOT_FOUND]: 500,
    [UtilityErrorCode.ENV_PARSE_ERROR]: 500,

    // JWT 관련 에러
    [UtilityErrorCode.JWT_SIGN_ERROR]: 500,
    [UtilityErrorCode.JWT_VERIFY_ERROR]: 401,
    [UtilityErrorCode.JWT_EXPIRED]: 401,
    [UtilityErrorCode.JWT_INVALID]: 401,

    // 기타 유틸리티 에러
    [UtilityErrorCode.FILE_OPERATION_ERROR]: 500,
    [UtilityErrorCode.NETWORK_ERROR]: 500,
    [UtilityErrorCode.PARSING_ERROR]: 400
  }

  // 에러 코드 접두사에 따라 적절한 매핑 테이블 선택
  if (Object.values(ErrorCode).includes(errorCode as ErrorCode)) {
    return apiErrorStatusCodeMap[errorCode as ErrorCode] || 500
  } else if (errorCode.startsWith('CTRL_')) {
    return controllerStatusCodeMap[errorCode] || 500
  } else if (errorCode.startsWith('SRV_')) {
    return serviceStatusCodeMap[errorCode] || 500
  } else if (errorCode.startsWith('REPO_')) {
    return repositoryStatusCodeMap[errorCode] || 500
  } else if (errorCode.startsWith('DB_')) {
    return databaseStatusCodeMap[errorCode] || 500
  } else if (errorCode.startsWith('MID_VAL_')) {
    return validatorStatusCodeMap[errorCode] || 400
  } else if (errorCode.startsWith('UTIL_')) {
    return utilityStatusCodeMap[errorCode] || 500
  }

  // 기본값: 내부 서버 오류
  return 500
}

/**
 * 사용자 친화적인 에러 메시지 가져오기
 */
export function getUserFriendlyMessage(errorCode: string): string {
  const messageMap: Record<string, string> = {
    // Validator 에러 메시지
    [ValidatorErrorCode.VALIDATION_FAILED]: "입력값이 유효하지 않습니다",
    [ValidatorErrorCode.TOKEN_REQUIRED]: "인증 토큰이 필요합니다",
    [ValidatorErrorCode.TOKEN_INVALID]: "유효하지 않은 토큰입니다",
    [ValidatorErrorCode.TOKEN_EXPIRED]: "만료된 토큰입니다",
    [ValidatorErrorCode.PERMISSION_DENIED]: "접근 권한이 없습니다",

    // Controller 에러 메시지
    [ControllerErrorCode.VALIDATION]: "입력값이 유효하지 않습니다",
    [ControllerErrorCode.AUTHENTICATION]: "인증이 필요합니다",
    [ControllerErrorCode.AUTHORIZATION]: "해당 작업에 대한 권한이 없습니다",
    [ControllerErrorCode.RESOURCE_NOT_FOUND]: "요청한 리소스를 찾을 수 없습니다",
    [ControllerErrorCode.BAD_REQUEST]: "잘못된 요청입니다",
    [ControllerErrorCode.INTERNAL_SERVER]: "서버 내부 오류가 발생했습니다",

    // Service 에러 메시지
    [ServiceErrorCode.UNAUTHORIZED]: "인증이 필요합니다",
    [ServiceErrorCode.VALIDATION]: "데이터 검증에 실패했습니다",
    [ServiceErrorCode.BUSINESS_RULE]: "비즈니스 규칙에 위배됩니다",
    [ServiceErrorCode.RESOURCE_NOT_FOUND]: "요청한 리소스를 찾을 수 없습니다",
    [ServiceErrorCode.DEPENDENCY]: "종속 서비스에 접근할 수 없습니다",
    [ServiceErrorCode.DATA_PROCESSING]: "데이터 처리 중 오류가 발생했습니다",
    [ServiceErrorCode.TRANSACTION]: "트랜잭션 처리 중 오류가 발생했습니다",
    [ServiceErrorCode.BAD_REQUEST]: "잘못된 요청입니다",

    // Repository 및 Database 에러는 일반적인 메시지로 대체
    [RepositoryErrorCode.QUERY_EXECUTION]: "데이터 액세스 중 오류가 발생했습니다",
    [RepositoryErrorCode.ENTITY_NOT_FOUND]: "데이터를 찾을 수 없습니다",
    [DatabaseErrorCode.CONNECTION_ERROR]: "데이터베이스 연결 오류가 발생했습니다",
    [DatabaseErrorCode.QUERY_ERROR]: "쿼리 실행 중 오류가 발생했습니다",

    // Utility 에러 메시지
    [UtilityErrorCode.DATA_PROCESSING]: "데이터 처리 중 오류가 발생했습니다",
    [UtilityErrorCode.VALIDATION]: "데이터 검증에 실패했습니다",
    [UtilityErrorCode.BUSINESS_RULE]: "비즈니스 규칙에 위배됩니다",
    [UtilityErrorCode.RESOURCE_NOT_FOUND]: "요청한 리소스를 찾을 수 없습니다",
    [UtilityErrorCode.UNAUTHORIZED]: "인증이 필요합니다",
    [UtilityErrorCode.BAD_REQUEST]: "잘못된 요청입니다",
    [UtilityErrorCode.JWT_SIGN_ERROR]: "토큰 생성 중 오류가 발생했습니다",
    [UtilityErrorCode.JWT_VERIFY_ERROR]: "토큰 검증에 실패했습니다",
    [UtilityErrorCode.JWT_EXPIRED]: "만료된 토큰입니다",
    [UtilityErrorCode.JWT_INVALID]: "유효하지 않은 토큰입니다",
  }

  return messageMap[errorCode] || "요청을 처리하는 중 오류가 발생했습니다"
}