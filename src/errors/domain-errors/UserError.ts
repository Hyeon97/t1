import { ApiError } from "../ApiError"
import { DomainError } from "./DomainError"

// 사용자 에러의 기본 클래스
export abstract class UserError extends DomainError {
  // 공통 속성이 필요하다면 여기에 추가
}

// 사용자를 찾을 수 없는 에러
export class UserNotFoundError extends UserError {
  user: string | number
  type: "ID" | "Email"
  constructor({ user, type }: { user: string | number; type: "ID" | "Email" }) {
    super()
    this.user = user
    this.type = type
    if (type === "ID") {
      this.message = `ID가 ${user}인 사용자를 찾을 수 없습니다`
    } else {
      this.message = `이메일이 ${user}인 사용자를 찾을 수 없습니다`
    }
  }

  toApiError(): ApiError {
    return ApiError.notFound({
      message: this.message,
      details: { user: this.user },
    })
  }
}
