import { NextFunction, Request, Response } from "express"
import { logger } from "../utils/logger/logger.util"
import { ErrorCode } from "./error-codes"
import { ErrorResponse, RequestInfo } from "./interfaces"

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500
  let errorCode = ErrorCode.INTERNAL_ERROR
  let message = "서버 내부 오류가 발생했습니다"
  let details = undefined

  // if (err instanceof ApiError || err instanceof BackupError || err instanceof ServerError) {
  //   statusCode = err.statusCode
  //   errorCode = err.errorCode
  //   message = err.message
  //   details = err.details
  // } else {
  //   // 일반 Error 객체인 경우
  //   message = err.message || message
  // }

  message = err.message || message

  // 요청 정보 준비
  const requestInfo: RequestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || "unknown",
    userId: (req as any).user?.id || "anonymous",
  }

  // 오류 심각도에 따른 로깅 레벨 조정
  if (statusCode >= 500) {
    logger.error(`[${errorCode}] ${message}`, {
      error: err.stack,
      request: requestInfo,
      details,
    })
  } else if (statusCode >= 400) {
    logger.warn(`[${errorCode}] ${message}`, {
      request: requestInfo,
      details,
    })
  }

  // //  누적 로그 메시지 한번에 기록
  // if (err instanceof BackupError || err instanceof ServerError) {
  //   logger.error("-")
  //   err.getFullMessage().map((e: string) => {
  //     logger.error(e)
  //   })
  //   logger.error("-")
  // }

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
    logger.error(stack)
  }

  res.status(statusCode).json({ success, error: { ...errorWithoutStack } })
}

// 404 Not Found 핸들러
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `리소스를 찾을 수 없습니다: ${req.originalUrl}`
  logger.warn(`[404] ${message} - ${req.method}`)

  // const error = ApiError.notFound({
  //   message,
  //   details: { url: req.originalUrl },
  // })
  // next(error)
}
