/**
 * 에러 시스템 진입점
 * 모든 에러 관련 요소를 중앙에서 내보냄
 */

// 타입 및 인터페이스
export * from './error-types'

// 기반 클래스
export { BaseError } from './base/base-error'

// 계층별 에러 클래스
export { ControllerError } from './controller/controller-error'
export { DatabaseError } from './database/database-error'
export { ValidatorError } from './middleware/validator-error'
export { RepositoryError } from './repository/repository-error'
export { ServiceError } from './service/service-error'
export { UtilityError } from './utility/utility-error'

// 에러 처리 관련
export { errorHandler } from './handler/error-handler'

//  404 Page Not Found
export { notFoundHandler } from './handler/error-not-found'

// 상태 코드 매핑
export { getStatusCodeFromErrorCode, getUserFriendlyMessage } from './status-code-mapper'

// 유틸리티 함수
export {
  createErrorChainItem,
  createUnifiedError, errorToString, formatErrorMessage, getClientMessageFromErrorChain,
  hasErrorChain
} from '../utils/error.utils'

// 레거시 API 에러 (이전 코드와의 호환성)
export { ApiError } from './ApiError'

