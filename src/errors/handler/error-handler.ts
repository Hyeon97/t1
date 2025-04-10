import { NextFunction, Request, Response } from "express"
import { ContextLogger } from "../../utils/logger/logger.custom"
import { ApiError } from "../ApiError"
import { BaseError } from "../base/base-error"
import { ErrorCode, ErrorResponse, RequestInfo, UnifiedError } from "../error-types"
import { createUnifiedError } from "../interfaces"
import { getUserFriendlyMessage } from "../status-code-mapper"

/**
 * 계층별 에러 코드를 API 에러 코드로 매핑
 */
function mapToApiErrorCode(errorCode: string): ErrorCode {
  const codeMap: Record<string, ErrorCode> = {
    // 공통 에러 코드 매핑
    UNKNOWN_ERROR: ErrorCode.INTERNAL_ERROR,
    METHOD_NOT_ALLOWED: ErrorCode.METHOD_NOT_ALLOWED,

    // Validator 에러 코드 매핑
    MID_VAL_001: ErrorCode.VALIDATION_ERROR,
    MID_VAL_002: ErrorCode.UNAUTHORIZED,
    MID_VAL_003: ErrorCode.UNAUTHORIZED,
    MID_VAL_004: ErrorCode.UNAUTHORIZED,
    MID_VAL_005: ErrorCode.FORBIDDEN,

    // Controller 에러 코드 매핑
    CTRL_001: ErrorCode.VALIDATION_ERROR,
    CTRL_002: ErrorCode.UNAUTHORIZED,
    CTRL_003: ErrorCode.FORBIDDEN,
    CTRL_004: ErrorCode.NOT_FOUND,
    CTRL_005: ErrorCode.BAD_REQUEST,
    CTRL_006: ErrorCode.INTERNAL_ERROR,

    // Service 에러 코드 매핑
    SRV_000: ErrorCode.UNAUTHORIZED,
    SRV_001: ErrorCode.VALIDATION_ERROR,
    SRV_002: ErrorCode.BUSINESS_RULE_VIOLATION,
    SRV_003: ErrorCode.NOT_FOUND,
    SRV_004: ErrorCode.DEPENDENCY_ERROR,
    SRV_005: ErrorCode.DATA_PROCESSING_ERROR,
    SRV_006: ErrorCode.TRANSACTION_ERROR,
    SRV_007: ErrorCode.BAD_REQUEST,

    // Repository 에러 코드 매핑
    REPO_001: ErrorCode.DATABASE_ERROR,
    REPO_002: ErrorCode.NOT_FOUND,
    REPO_003: ErrorCode.DATA_MAPPING_ERROR,
    REPO_004: ErrorCode.VALIDATION_ERROR,
    REPO_005: ErrorCode.DATABASE_ERROR,

    // Database 에러 코드 매핑
    DB_001: ErrorCode.CONNECTION_ERROR,
    DB_002: ErrorCode.QUERY_ERROR,
    DB_003: ErrorCode.DATA_INTEGRITY_ERROR,
    DB_004: ErrorCode.NOT_FOUND,
    DB_005: ErrorCode.TRANSACTION_ERROR,

    // Utility 에러 코드 매핑
    UTIL_001: ErrorCode.DATA_PROCESSING_ERROR,
    UTIL_002: ErrorCode.VALIDATION_ERROR,
    UTIL_003: ErrorCode.BUSINESS_RULE_VIOLATION,
    UTIL_004: ErrorCode.NOT_FOUND,
    UTIL_007: ErrorCode.UNAUTHORIZED,
    UTIL_008: ErrorCode.BAD_REQUEST,
    UTIL_JWT_001: ErrorCode.INTERNAL_ERROR,
    UTIL_JWT_002: ErrorCode.UNAUTHORIZED,
    UTIL_JWT_003: ErrorCode.UNAUTHORIZED,
    UTIL_JWT_004: ErrorCode.UNAUTHORIZED,
  }

  return codeMap[errorCode] || ErrorCode.INTERNAL_ERROR
}

/**
 * 에러로부터 에러 체인 구성 및 HTTP 상태 코드 결정
 */
function buildErrorChainFromError(err: Error): UnifiedError {
  let statusCode = 500
  let clientMessage = "서버 내부 오류가 발생했습니다"
  let clientErrorCode = ErrorCode.INTERNAL_ERROR
  let errorChain: any = []

  // BaseError 계열의 모든 에러 처리 (모든 계층별 에러가 이를 상속함)
  if (err instanceof BaseError) {
    statusCode = err.statusCode

    // 에러 체인을 사용하여 클라이언트 메시지와 에러 코드 결정
    if (err.errorChain && err.errorChain.length > 0) {
      errorChain = err.errorChain

      // 가장 상위 계층의 에러 코드를 API 에러 코드로 매핑
      clientErrorCode = mapToApiErrorCode(err.errorChain[0].errorCode)

      // 사용자 친화적인 메시지 결정
      clientMessage = getUserFriendlyMessage(err.errorChain[0].errorCode)
    } else {
      clientMessage = err.message
    }
  }
  // 이전 ApiError 타입 지원 (이전 코드와의 호환성)
  else if (err instanceof ApiError) {
    statusCode = err.statusCode
    clientErrorCode = err.errorCode
    clientMessage = err.message
    errorChain = [
      {
        layer: "controller",
        functionName: "handleRequest",
        errorCode: clientErrorCode,
        statusCode: err.statusCode,
        message: clientMessage,
        details: err.details,
      },
    ]
  }
  // 일반 에러인 경우
  else {
    if (err.message.includes('method not allowed')) {
      statusCode = 405
      clientMessage = "HTTP method not allowed"
      clientErrorCode = ErrorCode.METHOD_NOT_ALLOWED
      errorChain = [
        {
          layer: "middleware",
          functionName: "openApi",
          errorCode: "METHOD_NOT_ALLOWED",
          statusCode: 405,
          message: err.message || "HTTP method not allowed",
        },
      ]
    }
    else {
      errorChain = [
        {
          layer: "unknown",
          functionName: "unknownFunction",
          errorCode: "UNKNOWN_ERROR",
          statusCode: 500,
          message: err.message || "알 수 없는 오류",
          details: {
            stack: err.stack,
            name: err.name,
          },
        },
      ]
    }
  }

  return createUnifiedError({
    statusCode,
    clientMessage,
    clientErrorCode,
    errorChain,
  })
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
  // 에러 체인 구성 및 HTTP 상태 코드 결정
  const unifiedError = buildErrorChainFromError(err)

  // 오류 심각도에 따른 로깅 레벨 조정
  if (unifiedError.statusCode >= 500) {
    ContextLogger.error({
      message: `[${unifiedError.clientErrorCode}] ${unifiedError.clientMessage}`,
      meta: {
        request: requestInfo,
        errorChain: unifiedError.errorChain,
        statusCode: unifiedError.statusCode
      },
    })
  } else if (unifiedError.statusCode >= 400) {
    ContextLogger.warn({
      message: `[${unifiedError.clientErrorCode}] ${unifiedError.clientMessage}`,
      meta: {
        request: requestInfo,
        errorChain: unifiedError.errorChain,
        statusCode: unifiedError.statusCode
      },
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
      errorChain: unifiedError.errorChain,
    }
  } else {
    // 프로덕션 환경에서는 제한된 세부 정보만 제공
    if (unifiedError.errorChain && unifiedError.errorChain.length > 0) {
      const lastError = unifiedError.errorChain[unifiedError.errorChain.length - 1]
      const details = lastError.details || {}

      // 민감하지 않은 정보만 포함
      if (details) {
        if (Array.isArray(details)) {
          errorResponse.error.details = details
        } else {
          // details에서 stack 같은 민감한 정보 제거
          const safeDetails = { ...details }
          delete safeDetails.stack
          delete safeDetails.cause

          errorResponse.error.details = safeDetails
        }
      }
    }
  }

  // 상태 코드와 함께 응답 반환
  res.status(unifiedError.statusCode).json(errorResponse)
}
