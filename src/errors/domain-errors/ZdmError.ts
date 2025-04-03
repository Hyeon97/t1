//////////////////////////
//  ZDM Error 객체 정의  //
//////////////////////////

import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

export namespace ZdmError {
  /**
   * ZDM 찾을 수 없음
   */
  export class ZdmNotFound extends AppError {
    zdm: string | number
    type: "id" | "name"

    constructor({ zdm, type }: { zdm: string | number; type: "id" | "name" }) {
      const message = type === "id" ? `ID가 ${zdm}인 ZDM을 찾을 수 없습니다` : `이름이 ${zdm}인 ZDM을 찾을 수 없습니다`
      super({ message })
      this.zdm = zdm
      this.type = type
    }
    toApiError(): ApiError {
      return ApiError.notFound({
        message: this.message,
        details: { zdm: this.zdm, type: this.type },
      })
    }
  }

  /**
   * ZDM 요청 파라미터 에러
   */
  export class ZdmRequestParameterError extends AppError {
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
