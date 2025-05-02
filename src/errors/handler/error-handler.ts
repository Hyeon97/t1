import { ValidationError } from "class-validator"
import { NextFunction, Request, Response } from "express"
import { ErrorCode, ErrorLayer, ErrorResponse, getUserFriendlyMessage, NewError } from ".."
import { asyncContextStorage } from "../../utils/AsyncContext"
import { ContextLogger } from "../../utils/logger/logger.custom"

/**
 * 에러로부터 통합 에러 객체 생성
 */
function buildUnifiedError(err: Error) {
  let statusCode = 500
  let clientMessage = "서버 내부 오류가 발생했습니다"
  let clientErrorCode = ErrorCode.INTERNAL_ERROR
  let detail = null //  일반 사용자
  let log_debug = null //  디버깅
  // console.log("buildUnifiedError")
  // console.dir(err, { depth: null })
  // BaseError 계열의 모든 에러 처리 (모든 계층별 에러가 이를 상속함)
  if (err instanceof NewError) {
    // 상태 코드를 직접 사용
    statusCode = err.statusCode
    clientErrorCode = err.errorCode

    if (err instanceof ValidationError) {
      //  Validator 계층에서 발생한 에러
      clientMessage = `${getUserFriendlyMessage({ errorCode: err.errorCode })}`
      detail = { cause: err.message.split("||") }
      log_debug = err.metadata
    } else {
      //  그외 계층에서 발생한 에러
      clientMessage = err.message
      const errorName = err?.metadata?.error?.name
      const data = err?.metadata?.data
      let cause = err?.metadata?.error?.message || ""
      if (errorName === "Error" && cause === "") {
        cause = "서버 내부 오류 발생"
      }
      detail = { cause, data }
      log_debug = err.metadata
    }
  }
  // 일반 Error 객체
  else {
    if (err.message.includes("method not allowed")) {
      statusCode = 405
      clientMessage = "HTTP method not allowed"
      clientErrorCode = ErrorCode.METHOD_NOT_ALLOWED
      detail = { cause: err.message }
      log_debug = {
        layer: ErrorLayer.MIDDLEWARE,
      }
    } else {
      ; (statusCode = 500),
        (clientMessage = "알 수 없는 오류"),
        (clientErrorCode = ErrorCode.UNKNOWN_ERROR),
        (detail = { cause: err.message }),
        (log_debug = {
          layer: ErrorLayer.MIDDLEWARE,
        })
    }
  }

  return {
    statusCode,
    clientMessage,
    clientErrorCode,
    detail,
    timestamp: new Date().toISOString(),
    log_debug,
  }
}

/**
 * 글로벌 에러 핸들러
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // console.log('errorHandler')
  // console.dir(err, { depth: null })
  // 통합 에러 객체 생성
  const unifiedError = buildUnifiedError(err)
  // console.dir(unifiedError, { depth: null })

  // 오류 심각도에 따른 로깅 레벨 조정
  if (unifiedError.statusCode >= 500) {
    ContextLogger.error({
      message: `[${unifiedError.clientErrorCode}] ${unifiedError.clientMessage}`,
    })
  } else if (unifiedError.statusCode >= 400) {
    ContextLogger.warn({
      message: `[${unifiedError.clientErrorCode}] ${unifiedError.clientMessage}`,
    })
  }
  // console.log("errorHandler-unifiedError")
  // console.dir(unifiedError, { depth: null })
  // 응답 생성

  const errorResponse: ErrorResponse = {
    requestID: asyncContextStorage.getTaskID() || '-',
    success: false,
    error: {
      code: unifiedError.clientErrorCode,
      message: unifiedError.clientMessage,
      details: unifiedError.detail,
    },
    timestamp: unifiedError.timestamp,
  }

  // 개발 환경에서만 세부 정보 추가
  if (process.env.NODE_ENV !== "production") {
    errorResponse.debug = {
      statusCode: unifiedError.statusCode,
      ...unifiedError.log_debug,
    }

    if (errorResponse.debug.error instanceof Error) {
      const originalError = errorResponse.debug.error
      errorResponse.debug.error = {
        name: originalError.name,
        message: originalError.message,
        stack: originalError.stack,
      }
    }
  } else {
    // 프로덕션 환경에서는 제한된 세부 정보만 제공
    // if (unifiedError.errorChain && unifiedError.errorChain.length > 0) {
    //   const lastError = unifiedError.errorChain[unifiedError.errorChain.length - 1]
    //   const details = lastError.details || {}
    //   // 민감하지 않은 정보만 포함
    //   if (Array.isArray(details)) {
    //     errorResponse.error.details = details
    //   } else {
    //     // 민감한 정보 제거
    //     const safeDetails = { ...details }
    //     delete safeDetails.stack
    //     delete safeDetails.cause
    //     errorResponse.error.details = safeDetails
    //   }
    // }
  }

  // 상태 코드와 함께 응답 반환
  ContextLogger.error({ message: JSON.stringify(errorResponse, null, 2) })
  res.status(unifiedError.statusCode).json(errorResponse)
}
