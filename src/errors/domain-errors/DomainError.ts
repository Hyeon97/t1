import { ApiError } from "../ApiError"

export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  // ApiError로 변환하는 추상 메서드 (모든 자식 클래스에서 구현 필요)
  abstract toApiError(): ApiError
}