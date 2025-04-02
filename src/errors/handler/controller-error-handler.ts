// ////////////////////////////////////////
// //  Controller 공용 에러 처리 handler  //
// ////////////////////////////////////////

// import { NextFunction } from "express"
// import { ContextLogger } from "../../utils/logger/logger.custom"
// import { ApiError } from "../ApiError"
// import { AppError } from "../AppError"

// export const handleControllerError = ({
//   next, //  next Function ( controller 용 )
//   error, //  에러 객체 Or 에러 문구
//   logErrorMessage, //  로깅용 에러 메시지
//   apiErrorMessage, //  api 출력용 에러 메시지
//   operation, //  작업 내용
//   processingStage = "처리", //  작업 구분
//   errorCreator, //  변환할 에러
//   logContext = {}, //  각 에러에서 리턴하는 추가 에러 객체 data
// }: {
//   next: NextFunction
//   error: unknown
//   logErrorMessage: string
//   apiErrorMessage: string
//   operation: string
//   processingStage?: string
//   errorCreator: (params: { operation: string; processingStage?: string; reason: string; message: string }) => AppError
//   logContext?: Record<string, any>
// }): void | never => {
//   // 에러 로깅
//   ContextLogger.error({
//     message: logErrorMessage,
//     meta: {
//       error: error instanceof Error ? error.message : String(error),
//       ...logContext,
//     },
//   })

//   // 최종 리턴 에러 객체
//   let finalError: ApiError

//   // AppError 타입 처리
//   if (error instanceof AppError) {
//     // AppError의 toApiError 메서드를 직접 사용
//     finalError = error.toApiError()

//     // 추가 컨텍스트 정보 포함 (operation과 processingStage가 제공된 경우)
//     if (operation || processingStage) {
//       finalError.details = {
//         ...finalError.details,
//         // 에러 객체에 값이 있으면 그 값을 사용하고, 없으면 매개변수 값 사용
//         operation: (error as any).operation || operation,
//         processingStage: (error as any).processingStage || processingStage,
//         // 원본 에러 타입 포함
//         originalErrorType: error.constructor.name,
//       }
//     }
//   }
//   // 이미 ApiError인 경우
//   else if (error instanceof ApiError) {
//     finalError = error

//     // 추가 컨텍스트 정보 포함 (operation과 processingStage가 제공된 경우)
//     if (operation || processingStage) {
//       finalError.details = {
//         ...finalError.details,
//         operation,
//         processingStage,
//       }
//     }
//   }
//   // 다른 에러 타입은 errorCreator로 변환 또는 기본 에러 생성
//   else {
//     if (errorCreator) {
//       // errorCreator 함수가 제공된 경우
//       const appError = errorCreator({
//         operation,
//         processingStage,
//         reason: error instanceof Error ? error.message : String(error),
//         message: apiErrorMessage,
//       })
//       finalError = appError.toApiError()
//     } else {
//       // 기본 내부 서버 에러
//       finalError = ApiError.internal({
//         message: apiErrorMessage,
//         details: process.env.NODE_ENV !== "production" ? { error: error instanceof Error ? error.message : String(error) } : undefined,
//       })
//     }
//   }
//   // next 함수가 제공된 경우 (컨트롤러 컨텍스트)
//   if (next) {
//     next(finalError)
//     return
//   }
//   // next 함수가 없는 경우 (서비스 컨텍스트)
//   throw finalError
// }
