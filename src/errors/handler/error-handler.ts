import { NextFunction, Request, Response } from "express"
import { ContextLogger } from "../../utils/logger/logger.custom"
import { ApiError } from "../ApiError"
import { ControllerError } from "../controller/controller-error"
import { ErrorCode } from "../error-codes"
import { createUnifiedError, ErrorChainItem, ErrorLayer, ErrorResponse, RequestInfo, UnifiedError } from "../interfaces"

/**
 * 계층별 에러 코드를 API 에러 코드로 매핑
 */
function mapToApiErrorCode(errorCode: string): ErrorCode {
  const codeMap: Record<string, ErrorCode> = {
    // Controller 에러 코드 매핑
    CTRL_001: ErrorCode.VALIDATION_ERROR,
    CTRL_002: ErrorCode.UNAUTHORIZED,
    CTRL_003: ErrorCode.FORBIDDEN,
    CTRL_004: ErrorCode.NOT_FOUND,
    CTRL_005: ErrorCode.BAD_REQUEST,
    CTRL_006: ErrorCode.INTERNAL_ERROR,

    // Service 에러 코드 매핑
    SRV_001: ErrorCode.VALIDATION_ERROR,
    SRV_002: ErrorCode.BUSINESS_RULE_VIOLATION,
    SRV_003: ErrorCode.NOT_FOUND,
    SRV_004: ErrorCode.DEPENDENCY_ERROR,
    SRV_005: ErrorCode.DATA_PROCESSING_ERROR,
    SRV_006: ErrorCode.TRANSACTION_ERROR,

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
  }

  return codeMap[errorCode] || ErrorCode.INTERNAL_ERROR
}

/**
 * 사용자 친화적인 에러 메시지 가져오기
 */
function getUserFriendlyMessage(errorCode: string): string {
  const messageMap: Record<string, string> = {
    // Controller 에러 메시지
    CTRL_001: "입력값이 유효하지 않습니다",
    CTRL_002: "인증이 필요합니다",
    CTRL_003: "해당 작업에 대한 권한이 없습니다",
    CTRL_004: "요청한 리소스를 찾을 수 없습니다",
    CTRL_005: "잘못된 요청입니다",
    CTRL_006: "서버 내부 오류가 발생했습니다",

    // Service 에러 메시지
    SRV_001: "데이터 검증에 실패했습니다",
    SRV_002: "비즈니스 규칙에 위배됩니다",
    SRV_003: "요청한 리소스를 찾을 수 없습니다",
    SRV_004: "종속 서비스에 접근할 수 없습니다",
    SRV_005: "데이터 처리 중 오류가 발생했습니다",
    SRV_006: "트랜잭션 처리 중 오류가 발생했습니다",

    // Repository 및 Database 에러는 일반적인 메시지로 대체
    REPO_001: "데이터 액세스 중 오류가 발생했습니다",
    REPO_002: "데이터를 찾을 수 없습니다",
    DB_001: "데이터베이스 연결 오류가 발생했습니다",
    DB_002: "쿼리 실행 중 오류가 발생했습니다",
  }

  return messageMap[errorCode] || "요청을 처리하는 중 오류가 발생했습니다"
}

/**
 * 에러로부터 에러 체인 구성
 */
function buildErrorChainFromError(err: Error): UnifiedError {
  let statusCode = 500
  let clientMessage = "서버 내부 오류가 발생했습니다"
  let clientErrorCode = ErrorCode.INTERNAL_ERROR
  let errorChain: ErrorChainItem[] = []

  // 컨트롤러 에러인 경우
  if (err instanceof ControllerError) {
    statusCode = err.statusCode
    clientErrorCode = mapToApiErrorCode(err.errorChain[0].errorCode)
    clientMessage = getUserFriendlyMessage(err.errorChain[0].errorCode)
    errorChain = err.errorChain
  }
  // ApiError의 경우 (기존 에러 타입 지원)
  else if (err instanceof ApiError) {
    statusCode = err.statusCode
    clientErrorCode = err.errorCode
    clientMessage = err.message
    errorChain = [
      {
        layer: "controller" as ErrorLayer, // 타입 지정
        functionName: "handleRequest",
        errorCode: clientErrorCode,
        message: clientMessage,
        details: err.details,
      },
    ]
  }
  // 일반 에러인 경우
  else {
    errorChain = [
      {
        layer: "unknown" as ErrorLayer, // 타입 지정 (또는 "controller"로 처리)
        functionName: "unknownFunction",
        errorCode: "UNKNOWN_ERROR",
        message: err.message || "알 수 없는 오류",
        details: {
          stack: err.stack,
          name: err.name,
        },
      },
    ]
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

  // 에러 체인 구성
  const unifiedError = buildErrorChainFromError(err)

  // 오류 심각도에 따른 로깅 레벨 조정
  if (unifiedError.statusCode >= 500) {
    ContextLogger.error({
      message: `[${unifiedError.clientErrorCode}] ${unifiedError.clientMessage}`,
      meta: {
        // errorId: unifiedError.errorId,
        request: requestInfo,
        errorChain: unifiedError.errorChain,
      },
    })
  } else if (unifiedError.statusCode >= 400) {
    ContextLogger.warn({
      message: `[${unifiedError.clientErrorCode}] ${unifiedError.clientMessage}`,
      meta: {
        // errorId: unifiedError.errorId,
        request: requestInfo,
        errorChain: unifiedError.errorChain,
      },
    })
  }

  // 응답 생성
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: unifiedError.clientErrorCode,
      message: unifiedError.clientMessage,
      // errorId: unifiedError.errorId,
    },
    timestamp: unifiedError.timestamp,
  }

  // 개발 환경에서만 세부 정보 추가
  if (process.env.NODE_ENV !== "production") {
    errorResponse.error.details = {
      statusCode: unifiedError.statusCode,
      errorChain: unifiedError.errorChain,
    }
  }

  res.status(unifiedError.statusCode).json(errorResponse)
}

/**
 * 404 Not Found 핸들러
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `리소스를 찾을 수 없습니다: ${req.originalUrl}`
  ContextLogger.warn({ message: `[404] ${message} - ${req.method}` })

  const error = ApiError.notFound({
    message,
    details: { url: req.originalUrl },
  })
  next(error)
}
