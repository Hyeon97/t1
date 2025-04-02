///////////////////////////
//  Auth Error 객체 정의  //
///////////////////////////

import { ContextLogger } from "../../utils/logger/logger.custom"
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

  /**
   * 데이터 처리 및 가공 실패
   */
  export class DataProcessingError extends AppError {
    operation: string
    processingStage?: string
    reason?: string

    constructor({ operation, processingStage, reason, message }: { operation: string; processingStage?: string; reason?: string; message: string }) {
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
