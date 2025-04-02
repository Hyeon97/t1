////////////////////////////////////////////////
//  Controller,Service 공용 에러 처리 handler  //
////////////////////////////////////////////////

import { NextFunction } from "express"
import { ContextLogger } from "../../utils/logger/logger.custom"
import { ApiError } from "../ApiError"
import { AppError } from "../AppError"

/**
 * 공통 에러 처리 로직
 * 내부 헬퍼 함수로 사용됨
 */
const processError = ({
  error,
  logErrorMessage,
  apiErrorMessage,
  operation,
  processingStage,
  errorCreator,
  logContext = {},
}: {
  error: unknown
  logErrorMessage: string
  apiErrorMessage: string
  operation?: string
  processingStage?: string
  errorCreator?: (params: { operation: string; processingStage?: string; reason: string; message: string }) => AppError
  logContext?: Record<string, any>
}): ApiError => {
  // 에러 로깅
  ContextLogger.error({
    message: logErrorMessage,
    meta: {
      error: error instanceof Error ? error.message : String(error),
      ...logContext,
    },
  })

  // AppError 타입 처리
  if (error instanceof AppError) {
    // AppError의 toApiError 메서드를 직접 사용
    const apiError = error.toApiError()

    // 추가 컨텍스트 정보 포함 (operation과 processingStage가 제공된 경우)
    // if (operation || processingStage) {
    if (operation) {
      apiError.details = {
        ...apiError.details,
        // 에러 객체에 값이 있으면 그 값을 사용하고, 없으면 매개변수 값 사용
        operation: (error as any).operation || operation,
        // processingStage: (error as any).processingStage || processingStage,
        // 원본 에러 타입 포함
        errorType: error.constructor.name,
      }
    }

    return apiError
  }

  // 이미 ApiError인 경우
  if (error instanceof ApiError) {
    const apiError = error

    // 추가 컨텍스트 정보 포함 (operation과 processingStage가 제공된 경우)
    // if (operation || processingStage) {
    if (operation) {
      apiError.details = {
        ...apiError.details,
        operation,
        // processingStage,
      }
    }

    return apiError
  }

  // 다른 에러 타입은 errorCreator로 변환 또는 기본 에러 생성
  if (errorCreator) {
    // errorCreator 함수가 제공된 경우
    const appError = errorCreator({
      operation: (error as any).operation || operation,
      // processingStage: (error as any).processingStage || processingStage,
      reason: error instanceof Error ? error.message : String(error),
      message: apiErrorMessage,
    })
    return appError.toApiError()
  }

  // 기본 내부 서버 에러
  return ApiError.internal({
    message: apiErrorMessage,
    details:
      process.env.NODE_ENV !== "production"
        ? {
            error: error instanceof Error ? error.message : String(error),
            operation,
            processingStage,
          }
        : { operation, processingStage },
  })
}

/**
 * 서비스 계층용 에러 처리 함수
 */
export const handleServiceError = ({
  error,
  logErrorMessage,
  apiErrorMessage,
  operation,
  processingStage,
  errorCreator,
  logContext = {},
}: {
  error: unknown
  logErrorMessage: string
  apiErrorMessage: string
  operation?: string
  processingStage?: string
  errorCreator?: (params: { operation: string; processingStage?: string; reason: string; message: string }) => AppError
  logContext?: Record<string, any>
}): never => {
  const apiError = processError({
    error,
    logErrorMessage,
    apiErrorMessage,
    operation,
    processingStage,
    errorCreator,
    logContext,
  })

  throw apiError
}

/**
 * 컨트롤러 계층용 에러 처리 함수
 */
export const handleControllerError = ({
  next,
  error,
  logErrorMessage,
  apiErrorMessage,
  operation,
  processingStage,
  errorCreator,
  logContext = {},
}: {
  next: NextFunction
  error: unknown
  logErrorMessage: string
  apiErrorMessage: string
  operation?: string
  processingStage?: string
  errorCreator?: (params: { operation: string; processingStage?: string; reason: string; message: string }) => AppError
  logContext?: Record<string, any>
}): void => {
  const apiError = processError({
    error,
    logErrorMessage,
    apiErrorMessage,
    operation,
    processingStage,
    errorCreator,
    logContext,
  })

  next(apiError)
}
