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
    operation?: string
    processingStage?: string
    constructor({
      details,
      message,
      processingStage,
      operation,
    }: {
      details: Record<string, any>
      message: string
      processingStage?: string
      operation?: string
    }) {
      super({ message })
      this.details = details
      this.processingStage = processingStage
      this.operation = operation
    }

    toApiError(): ApiError {
      return ApiError.badRequest({
        message: this.message,
        details: this.details,
      })
    }
  }

  /**
   * 데이터 처리 및 가공 실패
   */
  export class DataProcessingError extends AppError {
    operation?: string
    processingStage?: string
    reason?: string

    constructor({ operation, processingStage, reason, message }: { operation?: string; processingStage?: string; reason?: string; message: string }) {
      super({ message })
      this.operation = operation
      this.processingStage = processingStage
      this.reason = reason
    }

    toApiError(): ApiError {
      return ApiError.internal({
        message: this.message,
        details: {
          operation: this.operation,
          processingStage: this.processingStage,
          reason: this.reason,
        },
      })
    }
  }
}
