import { ApiError } from "../ApiError"
import { DomainError } from "./DomainError"

// 사용자 에러의 기본 클래스
export abstract class AuthError extends DomainError {
  // 공통 속성이 필요하다면 여기에 추가
}

/**
 * token 찾을 수 없음
 */
export class TokenNotFoundError extends AuthError {
  constructor() {
    super()
    this.message = "Token을 찾을 수 없습니다"
  }

  toApiError(): ApiError {
    return ApiError.notFound({
      message: this.message,
      details: {},
    })
  }
}

/**
 * token 검증 실패
 */
export class TokenVerificationError extends AuthError {
  constructor() {
    super()
    this.message = "Token 검증 실패"
  }

  toApiError(): ApiError {
    return ApiError.unauthorized({
      message: this.message,
      details: {},
    })
  }
}
