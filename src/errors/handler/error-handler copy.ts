// import { NextFunction, Request, Response } from "express"
// import { ContextLogger } from "../../utils/logger/logger.custom"
// import { ApiError } from "../ApiError"
// import { ControllerError } from "../controller/controller-error"
// import { DatabaseError } from "../database/database-error"
// import { ErrorCode } from "../error-codes"
// import { ErrorResponse, RequestInfo } from "../interfaces"
// import { RepositoryError } from "../repository/repository-error"
// import { ServiceError } from "../service/service-error"

// export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
//   let statusCode = 500
//   let errorCode = ErrorCode.INTERNAL_ERROR
//   let message = "서버 내부 오류가 발생했습니다"
//   let details = undefined

//   // 에러 타입에 따른 처리
//   if (err instanceof ControllerError) {
//     statusCode = err.statusCode
//     errorCode = mapControllerErrorToErrorCode(err)
//     message = err.message
//     details = {
//       resource: err.resource,
//       action: err.action,
//       functionName: err.functionName,
//       metadata: err.metadata,
//     }
//   } else if (err instanceof ServiceError) {
//     const mappedError = mapServiceErrorToControllerError(err)
//     statusCode = mappedError.statusCode
//     errorCode = mapControllerErrorToErrorCode(mappedError)
//     message = mappedError.message
//     details = {
//       entity: err.entityName,
//       operation: err.operationName,
//       functionName: err.functionName,
//       metadata: err.metadata,
//     }
//   } else if (err instanceof RepositoryError || err instanceof DatabaseError) {
//     // Repository 또는 Database 에러는 일반적으로 내부 서버 오류로 처리
//     statusCode = 500
//     errorCode = ErrorCode.INTERNAL_ERROR
//     message = "서버 내부 오류가 발생했습니다"
//     details =
//       process.env.NODE_ENV !== "production"
//         ? {
//           originalError: err.name,
//           functionName: err.functionName,
//           metadata: err.metadata,
//         }
//         : undefined
//   } else if (err instanceof ApiError) {
//     statusCode = err.statusCode
//     errorCode = err.errorCode
//     message = err.message
//     details = err.details
//   } else {
//     // 일반 Error 객체인 경우
//     message = err.message || message
//   }

//   // 요청 정보 준비
//   const requestInfo: RequestInfo = {
//     method: req.method,
//     url: req.originalUrl,
//     ip: req.ip || "unknown",
//     userId: (req as any).user?.id || "anonymous",
//   }

//   // 오류 심각도에 따른 로깅 레벨 조정
//   if (statusCode >= 500) {
//     ContextLogger.error({
//       message: `[${errorCode}] ${message}`,
//       error: err,
//       meta: {
//         request: requestInfo,
//         details,
//       },
//     })
//   } else if (statusCode >= 400) {
//     ContextLogger.warn({
//       message: `[${errorCode}] ${message}`,
//       meta: {
//         request: requestInfo,
//         details,
//       },
//     })
//   }

//   // 응답 생성
//   const errorResponse: ErrorResponse = {
//     success: false,
//     error: {
//       code: errorCode,
//       message,
//       details: process.env.NODE_ENV === "production" ? undefined : details,
//     },
//     timestamp: new Date().toISOString(),
//   }

//   // 개발 환경에서만 스택 트레이스 추가
//   if (process.env.NODE_ENV !== "production") {
//     errorResponse.error.stack = err.stack || undefined
//   }

//   //  stack은 로깅으로만 남김
//   const { success, error } = errorResponse
//   const { stack, ...errorWithoutStack } = error
//   if (process.env.NODE_ENV !== "production") {
//     ContextLogger.debug({ message: `Error stack: ${stack}` })
//   }

//   res.status(statusCode).json({ success, error: { ...errorWithoutStack } })
// }

// // 404 Not Found 핸들러
// export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
//   const message = `리소스를 찾을 수 없습니다: ${req.originalUrl}`
//   ContextLogger.warn({ message: `[404] ${message} - ${req.method}` })

//   next(
//     ControllerError.resourceNotFoundError({
//       functionName: "notFoundHandler",
//       message,
//       resource: req.originalUrl,
//       action: req.method,
//     })
//   )
// }

// /**
//  * Controller 에러를 API 에러 코드로 매핑
//  */
// function mapControllerErrorToErrorCode(error: ControllerError): ErrorCode {
//   switch (error.code) {
//     case "CTRL_001":
//       return ErrorCode.VALIDATION_ERROR
//     case "CTRL_002":
//       return ErrorCode.UNAUTHORIZED
//     case "CTRL_003":
//       return ErrorCode.FORBIDDEN
//     case "CTRL_004":
//       return ErrorCode.NOT_FOUND
//     case "CTRL_005":
//       return ErrorCode.BAD_REQUEST
//     case "CTRL_006":
//     default:
//       return ErrorCode.INTERNAL_ERROR
//   }
// }

// /**
//  * Service 에러를 Controller 에러로 매핑
//  */
// function mapServiceErrorToControllerError(error: ServiceError): ControllerError {
//   return ControllerError.fromServiceError({
//     error,
//     functionName: "errorHandler",
//     resource: error.entityName,
//   })
// }

// /**
//  * Controller 에러 핸들러 - 컨트롤러 내에서 사용
//  */
// export const handleControllerError = ({
//   error,
//   next,
//   functionName,
//   resource,
//   action,
// }: {
//   error: unknown
//   next: NextFunction
//   functionName: string
//   resource?: string
//   action?: string
// }): void => {
//   ContextLogger.error({
//     // message: `컨트롤러 에러 발생: ${error instanceof Error ? error.message : String(error)}`,
//     message: `[Controller-Error] ${functionName}() 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
//     meta: { functionName, resource, action },
//   })

//   if (error instanceof ServiceError) {
//     next(
//       ControllerError.fromServiceError({
//         error,
//         functionName,
//         resource,
//         action,
//       })
//     )
//     return
//   }

//   if (error instanceof ControllerError) {
//     next(error)
//     return
//   }

//   next(
//     ControllerError.fromError({
//       error,
//       functionName,
//       resource,
//       action,
//     })
//   )
// }
