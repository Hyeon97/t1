import { ApiError } from "../ApiError"
import { DomainError } from "./DomainError"

// 사용자 에러의 기본 클래스
export abstract class UserError extends DomainError {
  // 공통 속성이 필요하다면 여기에 추가
}

// 사용자를 찾을 수 없는 에러
export class UserNotFoundError extends UserError {
  userId: string

  constructor(userId: string) {
    super(`User with ID ${userId} not found`)
    this.userId = userId
  }

  toApiError(): ApiError {
    return ApiError.notFound({
      message: this.message,
      details: { userId: this.userId }
    })
  }
}

// 이메일 중복 에러
export class DuplicateEmailError extends UserError {
  email: string

  constructor(email: string) {
    super(`User with email ${email} already exists`)
    this.email = email
  }

  toApiError(): ApiError {
    return ApiError.resourceExists({
      message: this.message,
      details: { email: this.email }
    })
  }
}

// 비밀번호 유효성 검사 에러
export class InvalidPasswordError extends UserError {
  reason: string

  constructor(reason: string) {
    super(`Invalid password: ${reason}`)
    this.reason = reason
  }

  toApiError(): ApiError {
    return ApiError.validationError({
      message: this.message,
      details: { reason: this.reason }
    })
  }
}

// 인증 실패 에러
export class UserAuthenticationError extends UserError {
  constructor(message: string = 'Authentication failed') {
    super(message)
  }

  toApiError(): ApiError {
    return ApiError.unauthorized({
      message: this.message
    })
  }
}

// 권한 부족 에러
export class UserPermissionError extends UserError {
  userId: string
  resource: string
  action: string

  constructor(userId: string, resource: string, action: string) {
    super(`User ${userId} does not have permission to ${action} ${resource}`)
    this.userId = userId
    this.resource = resource
    this.action = action
  }

  toApiError(): ApiError {
    return ApiError.forbidden({
      message: this.message,
      details: {
        userId: this.userId,
        resource: this.resource,
        action: this.action
      }
    })
  }
}