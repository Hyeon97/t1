// import { BaseError, ErrorDetails } from "../base/base-error"
// import { ServiceError, ServiceErrorCode } from "../service/service-error"

// export enum ControllerErrorCode {
//   VALIDATION = "CTRL_001",
//   AUTHENTICATION = "CTRL_002",
//   AUTHORIZATION = "CTRL_003",
//   RESOURCE_NOT_FOUND = "CTRL_004",
//   BAD_REQUEST = "CTRL_005",
//   INTERNAL_SERVER = "CTRL_006",
// }

// export interface ControllerErrorDetails extends ErrorDetails {
//   code: ControllerErrorCode
//   statusCode: number
//   resource?: string
//   action?: string
// }

// export class ControllerError extends BaseError {
//   public readonly code: ControllerErrorCode
//   public readonly statusCode: number
//   public readonly resource?: string
//   public readonly action?: string

//   constructor({ functionName, message, code, statusCode, cause, resource, action, metadata }: ControllerErrorDetails) {
//     super({ functionName, message, cause, metadata })
//     this.code = code
//     this.statusCode = statusCode
//     this.resource = resource
//     this.action = action
//   }

//   // Controller 에러 팩토리 메서드들
//   static validationError({
//     functionName,
//     message,
//     cause,
//     resource,
//     action,
//     metadata,
//   }: Omit<ControllerErrorDetails, "code" | "statusCode">): ControllerError {
//     return new ControllerError({
//       functionName,
//       message,
//       code: ControllerErrorCode.VALIDATION,
//       statusCode: 400,
//       cause,
//       resource,
//       action,
//       metadata,
//     })
//   }

//   static authenticationError({
//     functionName,
//     message,
//     cause,
//     resource,
//     action,
//     metadata,
//   }: Omit<ControllerErrorDetails, "code" | "statusCode">): ControllerError {
//     return new ControllerError({
//       functionName,
//       message,
//       code: ControllerErrorCode.AUTHENTICATION,
//       statusCode: 401,
//       cause,
//       resource,
//       action,
//       metadata,
//     })
//   }

//   static authorizationError({
//     functionName,
//     message,
//     cause,
//     resource,
//     action,
//     metadata,
//   }: Omit<ControllerErrorDetails, "code" | "statusCode">): ControllerError {
//     return new ControllerError({
//       functionName,
//       message,
//       code: ControllerErrorCode.AUTHORIZATION,
//       statusCode: 403,
//       cause,
//       resource,
//       action,
//       metadata,
//     })
//   }

//   static resourceNotFoundError({
//     functionName,
//     message,
//     cause,
//     resource,
//     action,
//     metadata,
//   }: Omit<ControllerErrorDetails, "code" | "statusCode">): ControllerError {
//     return new ControllerError({
//       functionName,
//       message,
//       code: ControllerErrorCode.RESOURCE_NOT_FOUND,
//       statusCode: 404,
//       cause,
//       resource,
//       action,
//       metadata,
//     })
//   }

//   static badRequestError({
//     functionName,
//     message,
//     cause,
//     resource,
//     action,
//     metadata,
//   }: Omit<ControllerErrorDetails, "code" | "statusCode">): ControllerError {
//     return new ControllerError({
//       functionName,
//       message,
//       code: ControllerErrorCode.BAD_REQUEST,
//       statusCode: 400,
//       cause,
//       resource,
//       action,
//       metadata,
//     })
//   }

//   static internalServerError({
//     functionName,
//     message,
//     cause,
//     resource,
//     action,
//     metadata,
//   }: Omit<ControllerErrorDetails, "code" | "statusCode">): ControllerError {
//     return new ControllerError({
//       functionName,
//       message,
//       code: ControllerErrorCode.INTERNAL_SERVER,
//       statusCode: 500,
//       cause,
//       resource,
//       action,
//       metadata,
//     })
//   }

//   // Service 에러를 Controller 에러로 변환하는 팩토리 메서드
//   static fromServiceError({
//     error,
//     functionName,
//     resource,
//     action,
//   }: {
//     error: ServiceError
//     functionName: string
//     resource?: string
//     action?: string
//   }): ControllerError {
//     let controllerError: ControllerError

//     switch (error.code) {
//       case ServiceErrorCode.RESOURCE_NOT_FOUND:
//         controllerError = ControllerError.resourceNotFoundError({
//           functionName,
//           message: `요청한 리소스를 찾을 수 없습니다${error.entityName ? `: ${error.entityName}` : ""}`,
//           cause: error,
//           resource: resource || error.entityName,
//           action,
//         })
//         break
//       case ServiceErrorCode.VALIDATION:
//         controllerError = ControllerError.validationError({
//           functionName,
//           message: `요청 데이터 유효성 검증 실패`,
//           cause: error,
//           resource: resource || error.entityName,
//           action: action || error.operationName,
//         })
//         break
//       case ServiceErrorCode.BUSINESS_RULE:
//         controllerError = ControllerError.badRequestError({
//           functionName,
//           message: `비즈니스 규칙 위반${error.operationName ? ` (${error.operationName})` : ""}`,
//           cause: error,
//           resource: resource || error.entityName,
//           action: action || error.operationName,
//         })
//         break
//       default:
//         controllerError = ControllerError.internalServerError({
//           functionName,
//           message: `서버 내부 오류가 발생했습니다`,
//           cause: error,
//           resource: resource || error.entityName,
//           action: action || error.operationName,
//           metadata: { originalCode: error.code },
//         })
//     }

//     return controllerError
//   }

//   // 일반 에러를 Controller 에러로 변환하는 팩토리 메서드
//   static fromError({
//     error,
//     functionName,
//     resource,
//     action,
//   }: {
//     error: unknown
//     functionName: string
//     resource?: string
//     action?: string
//   }): ControllerError {
//     if (error instanceof ServiceError) {
//       return ControllerError.fromServiceError({ error, functionName, resource, action })
//     }

//     if (error instanceof ControllerError) {
//       return error
//     }

//     const message = error instanceof Error ? error.message : String(error)

//     return ControllerError.internalServerError({
//       functionName,
//       message: `요청 처리 중 예상치 못한 오류가 발생했습니다`,
//       cause: error,
//       resource,
//       action,
//       metadata: { originalErrorMessage: message },
//     })
//   }
// }
