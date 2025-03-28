import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

export namespace UserError {
  /**
   * user 찾을 수 없음
   */
  export class UserNotFound extends AppError {
    user: string | number
    type: "ID" | "Email"

    constructor({ user, type }: { user: string | number; type: "ID" | "Email" }) {
      const message = type === "ID"
        ? `ID가 ${user}인 사용자를 찾을 수 없습니다`
        : `이메일이 ${user}인 사용자를 찾을 수 없습니다`

      super({ message })
      this.user = user
      this.type = type
    }

    toApiError(): ApiError {
      return ApiError.notFound({
        message: this.message,
        details: { user: this.user, type: this.type },
      })
    }
  }

  /**
   * email 중복
   */
  export class DuplicateEmail extends AppError {
    email: string

    constructor({ email }: { email: string }) {
      super({ message: `이메일 ${email}는 이미 사용 중입니다` })
      this.email = email
    }

    toApiError(): ApiError {
      return ApiError.conflict({
        message: this.message,
        details: { email: this.email },
      })
    }
  }
}