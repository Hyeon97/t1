/**
 * 에러 코드와 HTTP 상태 코드 매핑
 */

import { ControllerErrorCode } from "./controller/controller-error"
import { DatabaseErrorCode } from "./database/database-error"
import { ErrorCode } from "./error-codes"
import { ValidatorErrorCode } from "./middleware/validator-error"
import { RepositoryErrorCode } from "./repository/repository-error"
import { ServiceErrorCode } from "./service/service-error"
import { UtilityErrorCode } from "./utility/utility-error"

// 모든 에러 코드 타입을 포함하는 유니온 타입
export type AllErrorCodes =
  | ErrorCode
  | ControllerErrorCode
  | ServiceErrorCode
  | RepositoryErrorCode
  | DatabaseErrorCode
  | ValidatorErrorCode
  | UtilityErrorCode
  | string  // 알 수 없는 에러 코드를 위한 fallback

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
  const controllerStatusCodeMap: Record<ControllerErrorCode, number> = {
    VALIDATION: 400,
    AUTHENTICATION: 401,
    AUTHORIZATION: 403,
    RESOURCE_NOT_FOUND: 404,
    BAD_REQUEST: 400,
    INTERNAL_SERVER: 500
  }

  // Service 에러 코드 매핑
  const serviceStatusCodeMap: Record<ServiceErrorCode, number> = {
    UNAUTHORIZED: 401,
    VALIDATION: 400,
    BUSINESS_RULE: 422, // Unprocessable Entity
    RESOURCE_NOT_FOUND: 404,
    DEPENDENCY: 502, // Bad Gateway
    DATA_PROCESSING: 500,
    TRANSACTION: 500,
    BAD_REQUEST: 400
  }

  // Repository 에러 코드 매핑
  const repositoryStatusCodeMap: Record<RepositoryErrorCode, number> = {
    QUERY_EXECUTION: 500,
    ENTITY_NOT_FOUND: 404,
    DATA_MAPPING: 500,
    VALIDATION: 400,
    DATABASE: 500
  }

  // Database 에러 코드 매핑
  const databaseStatusCodeMap: Record<DatabaseErrorCode, number> = {
    CONNECTION_ERROR: 500,
    QUERY_ERROR: 500,
    DATA_INTEGRITY_ERROR: 500,
    RECORD_NOT_FOUND: 404,
    TRANSACTION_ERROR: 500
  }

  // Validator 에러 코드 매핑
  const validatorStatusCodeMap: Record<ValidatorErrorCode, number> = {
    VALIDATION_FAILED: 400,
    TOKEN_REQUIRED: 401,
    TOKEN_INVALID: 401,
    TOKEN_EXPIRED: 401,
    PERMISSION_DENIED: 403
  }

  // Utility 에러 코드 매핑
  const utilityStatusCodeMap: Partial<Record<UtilityErrorCode, number>> = {
    DATA_PROCESSING: 500,
    VALIDATION: 400,
    BUSINESS_RULE: 422,
    RESOURCE_NOT_FOUND: 404,
    DEPENDENCY: 502,
    TRANSACTION: 500,
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,

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
    PARSING_ERROR: 400
  }

  // 에러 코드의 접두사에 따라 적절한 매핑 테이블 선택
  if (Object.values(ErrorCode).includes(errorCode as ErrorCode)) {
    return apiErrorStatusCodeMap[errorCode as ErrorCode]
  } else if (errorCode.startsWith('CTRL_')) {
    return controllerStatusCodeMap[errorCode as ControllerErrorCode] || 500
  } else if (errorCode.startsWith('SRV_')) {
    return serviceStatusCodeMap[errorCode as ServiceErrorCode] || 500
  } else if (errorCode.startsWith('REPO_')) {
    return repositoryStatusCodeMap[errorCode as RepositoryErrorCode] || 500
  } else if (errorCode.startsWith('DB_')) {
    return databaseStatusCodeMap[errorCode as DatabaseErrorCode] || 500
  } else if (errorCode.startsWith('MID_VAL_')) {
    return validatorStatusCodeMap[errorCode as ValidatorErrorCode] || 400
  } else if (errorCode.startsWith('UTIL_')) {
    return utilityStatusCodeMap[errorCode as UtilityErrorCode] || 500
  }

  // 기본값: 내부 서버 오류
  return 500
}