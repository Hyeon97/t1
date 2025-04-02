/////////////////////////////
//  Backup Error 객체 정의  //
/////////////////////////////

import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

export namespace JobError {
  /**
   * Backup 정보 찾을 수 없음
   */
  export class BackupNotFound extends AppError {
    backup: string | number
    type: "id" | "name"

    constructor({ backup, type }: { backup: string | number; type: "id" | "name" }) {
      const message = type === "id" ? `ID가 ${backup}인 Backup 정보를 찾을 수 없습니다` : `이름이 ${backup}인 Backup 정보를 찾을 수 없습니다`

      super({ message })
      this.backup = backup
      this.type = type
    }

    toApiError(): ApiError {
      return ApiError.notFound({
        message: this.message,
        details: { Backup: this.backup, type: this.type },
      })
    }
  }

  /**
   * 관련된 정보 존재하지 않음
   */
  export class RelatedDataNotFound extends AppError {
    dataType: string
    identifier?: string | number

    constructor({ dataType, identifier, message }: { dataType: string; identifier?: string | number; message?: string }) {
      const defaultMessage = identifier ? `관련된 ${dataType} 정보(${identifier})를 찾을 수 없습니다` : `관련된 ${dataType} 정보를 찾을 수 없습니다`

      super({ message: message || defaultMessage })
      this.dataType = dataType
      this.identifier = identifier
    }

    toApiError(): ApiError {
      return ApiError.notFound({
        message: this.message,
        details: {
          dataType: this.dataType,
          identifier: this.identifier,
        },
      })
    }
  }

  /**
   * 백업 작업 중 데이터 조회 실패
   */
  export class DataRetrievalError extends AppError {
    operation: string
    dataType: string
    reason?: string

    constructor({ operation, dataType, reason, message }: { operation: string; dataType: string; reason?: string; message?: string }) {
      const defaultMessage = `${operation} 작업 중 ${dataType} 데이터 조회에 실패했습니다${reason ? `: ${reason}` : ""}`

      super({ message: message || defaultMessage })
      this.operation = operation
      this.dataType = dataType
      this.reason = reason
    }

    toApiError(): ApiError {
      return ApiError.internal({
        message: this.message,
        details: {
          operation: this.operation,
          dataType: this.dataType,
          reason: this.reason,
        },
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

  /**
   * Backup 정보 요청 파라미터 에러
   */
  export class BackupRequestParameterError extends AppError {
    details: Record<string, any>

    constructor({ details, message }: { details: Record<string, any>; message: string }) {
      super({ message })
      this.details = details
    }

    toApiError(): ApiError {
      return ApiError.badRequest({
        message: this.message,
        details: this.details,
      })
    }
  }
}
