/////////////////////////////
//  Server Error 객체 정의  //
/////////////////////////////

import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

export namespace ServerError {
  /**
   * Server 찾을 수 없음
   */
  export class ServerNotFound extends AppError {
    server: string | number
    type: "id" | "name"

    constructor({ server, type }: { server: string | number; type: "id" | "name" }) {
      const message = type === "id" ? `ID가 ${server}인 Server를 찾을 수 없습니다` : `이름이 ${server}인 server를 찾을 수 없습니다`

      super({ message })
      this.server = server
      this.type = type
    }

    toApiError(): ApiError {
      return ApiError.notFound({
        message: this.message,
        details: { server: this.server, type: this.type },
      })
    }
  }
  /**
   * Server partition 찾을 수 없음
   */
  /**
   * Server netework 찾을 수 없음
   */
  /**
   * Server disk 찾을 수 없음
   */
  /**
   * Server repository 찾을 수 없음
   */
  /**
   * Server 요청 파라미터 에러
   */
  export class ServerRequestParameterError extends AppError {
    details: Record<string, any>
    constructor({ message, details = {} }: { message: string, details: Record<string, any> }) {
      super({ message })
      this.details = details
    }

    toApiError(): ApiError {
      return ApiError.badRequest({
        message: this.message,
        details: this.details
      })
    }
  }
}
