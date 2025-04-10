// import { createErrorChainItem, ErrorChainItem, ErrorLayer } from "../interfaces"
// import { ServiceError, ServiceErrorCode } from "../service/service-error"

// export enum ControllerErrorCode {
//   VALIDATION = "CTRL_001",
//   AUTHENTICATION = "CTRL_002",
//   AUTHORIZATION = "CTRL_003",
//   RESOURCE_NOT_FOUND = "CTRL_004",
//   BAD_REQUEST = "CTRL_005",
//   INTERNAL_SERVER = "CTRL_006",
// }

// export interface ControllerErrorParams {
//   functionName: string
//   message: string
//   cause?: unknown
//   metadata?: Record<string, any>
//   statusCode?: number
// }

// export class ControllerError extends Error {
//   public readonly errorChain: ErrorChainItem[]
//   public readonly statusCode: number

//   constructor({ errorCode, functionName, message, cause, statusCode = 500, metadata }: ControllerErrorParams & { errorCode: ControllerErrorCode }) {
//     super(message)
//     this.name = this.constructor.name
//     this.statusCode = statusCode

//     // 상세 정보 구성
//     const details: Record<string, any> = { ...metadata }

//     // 에러 체인 생성
//     this.errorChain = [
//       createErrorChainItem({
//         layer: "controller" as ErrorLayer,
//         functionName,
//         errorCode,
//         message,
//         details,
//       }),
//     ]

//     // 원인 에러의 체인 병합
//     if (cause instanceof ServiceError) {
//       this.errorChain.push(...cause.errorChain)
//     } else if (cause instanceof ControllerError) {
//       this.errorChain.push(...cause.errorChain)
//     }
//     // else if (cause instanceof Error) {
//     //   details.originalError = {
//     //     name: cause.name,
//     //     message: cause.message,
//     //   }
//     // }

//     // 스택 트레이스 보존
//     Error.captureStackTrace(this, this.constructor)
//   }

//   // Controller 에러 팩토리 메서드들
//   static validationError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
//     return new ControllerError({
//       errorCode: ControllerErrorCode.VALIDATION,
//       functionName,
//       message,
//       cause,
//       statusCode: 400,
//       metadata,
//     })
//   }

//   static authenticationError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
//     return new ControllerError({
//       errorCode: ControllerErrorCode.AUTHENTICATION,
//       functionName,
//       message,
//       cause,
//       statusCode: 401,
//       metadata,
//     })
//   }

//   static authorizationError({ functionName, message, cause, metadata, }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
//     return new ControllerError({
//       errorCode: ControllerErrorCode.AUTHORIZATION,
//       functionName,
//       message,
//       cause,
//       statusCode: 403,
//       metadata,
//     })
//   }

//   static resourceNotFoundError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
//     return new ControllerError({
//       errorCode: ControllerErrorCode.RESOURCE_NOT_FOUND,
//       functionName,
//       message,
//       cause,
//       statusCode: 404,
//       metadata,
//     })
//   }

//   static badRequestError({ functionName, message, cause, metadata }: Omit<ControllerErrorParams, "statusCode">): ControllerError {
//     return new ControllerError({
//       errorCode: ControllerErrorCode.BAD_REQUEST,
//       functionName,
//       message,
//       cause,
//       statusCode: 400,
//       metadata,
//     })
//   }

//   static internalServerError({ functionName, message, cause, metadata, statusCode = 500 }: ControllerErrorParams): ControllerError {
//     return new ControllerError({
//       errorCode: ControllerErrorCode.INTERNAL_SERVER,
//       functionName,
//       message,
//       cause,
//       statusCode,
//       metadata,
//     })
//   }

//   // Service 에러를 Controller 에러로 변환하는 팩토리 메서드
//   static fromServiceError({ error, functionName }: { error: ServiceError; functionName: string }): ControllerError {
//     // Service 에러의 첫 번째 항목에서 정보 추출
//     const svcErrorItem = error.errorChain[0]

//     let controllerError: ControllerError

//     switch (svcErrorItem.errorCode) {
//       case ServiceErrorCode.RESOURCE_NOT_FOUND:
//         controllerError = ControllerError.resourceNotFoundError({
//           functionName,
//           message: `요청한 리소스를 찾을 수 없습니다`,
//           cause: error,
//         })
//         break
//       case ServiceErrorCode.VALIDATION:
//         controllerError = ControllerError.validationError({
//           functionName,
//           message: `요청 데이터 유효성 검증 실패`,
//           cause: error,
//         })
//         break
//       case ServiceErrorCode.BUSINESS_RULE:
//         controllerError = ControllerError.badRequestError({
//           functionName,
//           message: `비즈니스 규칙 위반`,
//           cause: error,
//         })
//         break
//       default:
//         controllerError = ControllerError.internalServerError({
//           functionName,
//           message: `서버 내부 오류가 발생했습니다`,
//           cause: error,
//           metadata: { originalCode: svcErrorItem.errorCode },
//         })
//     }

//     return controllerError
//   }

//   // 일반 에러를 Controller 에러로 변환하는 팩토리 메서드
//   static fromError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): ControllerError {
//     // 일반 에러 타입인 경우 ControllerError로 변환
//     // 다른 타입인 경우 ControllerError로 간주 ( 사전 필터링에서 다른 타입은 못들어 온다고 간주 )
//     if (error instanceof Error) {
//       const msg = message || error instanceof Error ? error.message : String(error)
//       return ControllerError.internalServerError({
//         functionName,
//         message: msg || `요청 처리 중 예상치 못한 오류가 발생했습니다`,
//         cause: error,
//       })
//     } else if (error instanceof ServiceError) {
//       return ControllerError.fromServiceError({ error, functionName })
//     } else return error as ControllerError
//   }
// }
