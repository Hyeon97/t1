// /////////////////////////////////////
// //  Service 공용 에러 처리 handler  //
// /////////////////////////////////////

// import { ContextLogger } from "../../utils/logger/logger.custom"
// import { AppError } from "../AppError"

// export const handleServiceError = ({
//   error, //  에러 객체 Or 에러 문구
//   logErrorMessage, //  로깅용 에러 메시지
//   apiErrorMessage, //  api 출력용 에러 메시지
//   operation, //  작업 내용
//   processingStage = "처리", //  작업 구분
//   errorCreator, //  변환할 에러
//   logContext = {}, //  각 에러에서 리턴하는 추가 에러 객체 data
// }: {
//   error: unknown
//   logErrorMessage: string
//   apiErrorMessage: string
//   operation: string
//   processingStage?: string
//   errorCreator: (params: { operation: string; processingStage?: string; reason: string; message: string }) => AppError
//   logContext?: Record<string, any>
// }): never => {
//   // 에러 로깅
//   ContextLogger.error({
//     message: logErrorMessage,
//     meta: {
//       error: error instanceof Error ? error.message : String(error),
//       ...logContext,
//     },
//   })

//   // AppError 타입 유지하되, 원본 에러 정보를 detail에 포함
//   if (error instanceof AppError) {
//     // AppError의 toApiError 메서드를 직접 사용
//     const apiError = error.toApiError()

//     // 추가 컨텍스트 정보 포함
//     apiError.details = {
//       ...apiError.details,
//       operation: (error as any).operation || operation,
//       processingStage: (error as any).processingStage || processingStage,
//       // 원본 에러 타입 포함
//       originalErrorType: error.constructor.name,
//     }

//     throw apiError
//   }

//   // 다른 에러 타입은 errorCreator로 변환
//   throw errorCreator({
//     operation,
//     processingStage,
//     reason: error instanceof Error ? error.message : String(error),
//     message: apiErrorMessage,
//   })
// }
