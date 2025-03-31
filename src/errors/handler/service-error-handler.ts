/////////////////////////////////////
//  Service 공용 에러 처리 handler  //
/////////////////////////////////////

import { ContextLogger } from "../../utils/logger/logger.custom"
import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

export const handleServiceError = ({
  error,
  logErrorMessage,
  apiErrorMessage,
  operation,
  dataType,
  processingStage = "처리",
  errorCreator,
  logContext = {},
}: {
  error: unknown
  logErrorMessage: string
  apiErrorMessage: string
  operation?: string
  dataType?: string
  processingStage?: string
  errorCreator?: (params: {
    operation: string
    dataType: string
    processingStage: string
    reason: string
    message: string
  }) => AppError
  logContext?: Record<string, any>
}): never => {
  // 이미 처리된 에러는 그대로 전파
  if (error instanceof AppError || error instanceof ApiError) {
    throw error
  }

  // 에러 로깅
  ContextLogger.error({
    message: logErrorMessage,
    meta: {
      error: error instanceof Error ? error.message : String(error),
      ...logContext,
    },
  })

  // 에러 생성자 함수와 도메인 컨텍스트 정보가 제공된 경우 해당 에러 생성
  if (errorCreator && operation && dataType) {
    throw errorCreator({
      operation,
      dataType,
      processingStage,
      reason: error instanceof Error ? error.message : String(error),
      message: apiErrorMessage
    })
  }

  // 그 외의 경우는 일반 API 에러로 변환
  throw ApiError.internal({ message: apiErrorMessage })
}