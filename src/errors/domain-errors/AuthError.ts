///////////////////////////
//  Auth Error 객체 정의  //
///////////////////////////

import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

export namespace AuthError {
  /**
   * token 찾을 수 없음
   */
  export class TokenNotFound extends AppError {
    constructor() {
      super({ message: "Token을 찾을 수 없습니다" })
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
  export class TokenVerificationFail extends AppError {
    constructor() {
      super({ message: "Token 검증 실패" })
    }

    toApiError(): ApiError {
      return ApiError.unauthorized({
        message: this.message,
        details: {},
      })
    }
  }
}
