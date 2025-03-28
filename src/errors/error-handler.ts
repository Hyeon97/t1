import { NextFunction, Request, Response } from "express"
import { ContextLogger } from "../utils/logger/logger.custom"
import { ApiError } from "./ApiError"
import { AppError } from "./AppError"
import { ErrorCode } from "./error-codes"
import { ErrorResponse, RequestInfo } from "./interfaces"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500
  let errorCode = ErrorCode.INTERNAL_ERROR
  let message = "서버 내부 오류가 발생했습니다"
  let details = undefined

  // AppError를 처리하고 ApiError로 변환
  if (err instanceof AppError) {

    const apiError = err.toApiError()
    statusCode = apiError.statusCode
    errorCode = apiError.errorCode
    message = apiError.message
    details = apiError.details
  } else if (err instanceof ApiError) {
    // 이미 ApiError인 경우
    statusCode = err.statusCode
    errorCode = err.errorCode
    message = err.message
    details = err.details
  } else {
    // 일반 Error 객체인 경우
    message = err.message || message
  }

  // 요청 정보 준비
  const requestInfo: RequestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || "unknown",
    userId: (req as any).user?.id || "anonymous",
  }

  // 오류 심각도에 따른 로깅 레벨 조정
  if (statusCode >= 500) {
    ContextLogger.error({
      message: `[${errorCode}] ${message}`,
      error: err,
      meta: {
        request: requestInfo,
        details
      }
    })
  } else if (statusCode >= 400) {
    ContextLogger.warn({
      message: `[${errorCode}] ${message}`,
      meta: {
        request: requestInfo,
        details
      }
    })
  }
  // 응답 생성
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      details: process.env.NODE_ENV === "production" ? undefined : details,
    },
    timestamp: new Date().toISOString(),
  }

  // 개발 환경에서만 스택 트레이스 추가
  if (process.env.NODE_ENV !== "production") {
    errorResponse.error.stack = err.stack || undefined
  }

  //  stack은 로깅으로만 남김
  const { success, error } = errorResponse
  const { stack, ...errorWithoutStack } = error
  if (process.env.NODE_ENV !== "production") {
    ContextLogger.debug({ message: `Error stack: ${stack}` })
  }

  res.status(statusCode).json({ success, error: { ...errorWithoutStack } })
}

// 404 Not Found 핸들러
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `리소스를 찾을 수 없습니다: ${req.originalUrl}`
  ContextLogger.warn({ message: `[404] ${message} - ${req.method}` })

  const error = ApiError.notFound({
    message,
    details: { url: req.originalUrl },
  })
  next(error)
}
