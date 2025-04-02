//////////////////////////
//  ZDM Error 객체 정의  //
//////////////////////////

import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

export namespace ZdmError {
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
