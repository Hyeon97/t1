////////////////////////////////////////
//  Controller 공용 에러 처리 handler  //
////////////////////////////////////////

import { NextFunction } from "express"
import { ContextLogger } from "../../utils/logger/logger.custom"
import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

export const handleControllerError = ({
  next,
  error,
  logErrorMessage,
  apiErrorMessage,
  logContext = {},
}: {
  next: NextFunction
  error: unknown
  logErrorMessage: string
  apiErrorMessage: string
  logContext?: Record<string, any>
}): void => {
  // 에러 로깅
  ContextLogger.error({
    message: logErrorMessage,
    error: error instanceof Error ? error : undefined,
  })

  // AppError는 toApiError로 변환하여 처리 (한 번의 체크로 모든 도메인 에러 처리)
  if (error instanceof AppError) {
    next(error.toApiError())
    return
  }

  // 이미 ApiError인 경우
  if (error instanceof ApiError) {
    next(error)
    return
  }

  // 새로운 API 에러로 변환
  next(ApiError.internal({
    message: apiErrorMessage,
    details: process.env.NODE_ENV !== "production"
      ? { error: error instanceof Error ? error.message : String(error) }
      : undefined
  }))
}