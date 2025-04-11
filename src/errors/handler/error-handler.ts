import { NextFunction, Request, Response } from "express"
import { ApiError, BaseError, ErrorCode, ErrorLayer, ErrorResponse, getUserFriendlyMessage, RequestInfo } from ".."
import { ContextLogger } from "../../utils/logger/logger.custom"

/**
 * 에러로부터 통합 에러 객체 생성
 */
function buildUnifiedError(err: Error) {
  let statusCode = 500
  let clientMessage = "서버 내부 오류가 발생했습니다"
  let clientErrorCode = ErrorCode.INTERNAL_ERROR
  let errorChain: any[] = []
  let detail = null

  // BaseError 계열의 모든 에러 처리 (모든 계층별 에러가 이를 상속함)
  if (err instanceof BaseError) {
    // 상태 코드를 직접 사용
    statusCode = err.statusCode
    clientErrorCode = err.errorCode
    clientMessage = `${err.message} || ${getUserFriendlyMessage({ errorCode: err.errorCode })} `
    detail = err.metadata
  }
  // ApiError 호환성 유지
  else if (err instanceof ApiError) {
    statusCode = err.statusCode
    clientErrorCode = err.errorCode
    clientMessage = err.message
    detail = {
      ...err.metadata,
      ...err.details,
    }
    // errorChain = [
    //   {
    //     layer: ErrorLayer.CONTROLLER,
    //     method: "handleRequest",
    //     errorCode: clientErrorCode,
    //     statusCode: err.statusCode,
    //     message: clientMessage,
    //     details: err.details,
    //   },
    // ]
  }
  // 일반 Error 객체
  else {
    if (err.message.includes("method not allowed")) {
      statusCode = 405
      clientMessage = err.message || "HTTP method not allowed"
      clientErrorCode = ErrorCode.METHOD_NOT_ALLOWED
      detail = {
        layer: ErrorLayer.MIDDLEWARE,
      }
      // errorChain = [
      //   {
      //     layer: ErrorLayer.MIDDLEWARE,
      //     method: "openApi",
      //     errorCode: ErrorCode.METHOD_NOT_ALLOWED,
      //     statusCode: 405,
      //     message: err.message || "HTTP method not allowed",
      //   },
      // ]
    } else {
      ;(statusCode = 500),
        (clientMessage = err.message || "알 수 없는 오류"),
        (clientErrorCode = ErrorCode.UNKNOWN_ERROR),
        (detail = {
          layer: ErrorLayer.MIDDLEWARE,
        })
      // errorChain = [
      //   {
      //     layer: ErrorLayer.UNKNOWN,
      //     method: "unknownFunction",
      //     errorCode: ErrorCode.UNKNOWN_ERROR,
      //     statusCode: 500,
      //     message: err.message || "알 수 없는 오류",
      //     details: {
      //       stack: err.stack,
      //       name: err.name,
      //     },
      //   },
      // ]
    }
  }

  return {
    statusCode,
    clientMessage,
    clientErrorCode,
    detail,
    timestamp: new Date().toISOString(),
  }
}

/**
 * 글로벌 에러 핸들러
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // 요청 정보 준비
  const requestInfo: RequestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || "unknown",
    userId: (req as any).user?.id || "anonymous",
  }
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

  // 응답 생성
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: unifiedError.clientErrorCode,
      message: unifiedError.clientMessage,
    },
    timestamp: unifiedError.timestamp,
  }

  // 개발 환경에서만 세부 정보 추가
  if (process.env.NODE_ENV !== "production") {
    errorResponse.error.details = {
      statusCode: unifiedError.statusCode,
      ...unifiedError.detail,
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
  res.status(unifiedError.statusCode).json(errorResponse)
}
