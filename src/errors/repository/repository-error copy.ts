// import { BaseError, ErrorDetails } from "../base/base-error"
// import { DatabaseError, DatabaseErrorCode } from "../database/database-error"

// export enum RepositoryErrorCode {
//   QUERY_EXECUTION = "REPO_001",
//   ENTITY_NOT_FOUND = "REPO_002",
//   DATA_MAPPING = "REPO_003",
//   VALIDATION = "REPO_004",
//   DATABASE = "REPO_005",
// }

// export interface RepositoryErrorDetails extends ErrorDetails {
//   code: RepositoryErrorCode
//   entityName?: string
//   identifier?: any
// }

// export class RepositoryError extends BaseError {
//   public readonly code: RepositoryErrorCode
//   public readonly entityName?: string
//   public readonly identifier?: any

//   constructor({ functionName, message, code, cause, entityName, identifier, metadata }: RepositoryErrorDetails) {
//     super({ functionName, message, cause, metadata })
//     this.code = code
//     this.entityName = entityName
//     this.identifier = identifier
//   }

//   // 구체적인, 일반적인 Repository 에러 팩토리 메서드들
//   static queryExecutionError({
//     functionName,
//     message,
//     cause,
//     entityName,
//     metadata,
//   }: Omit<RepositoryErrorDetails, "code" | "identifier">): RepositoryError {
//     return new RepositoryError({
//       functionName,
//       message,
//       code: RepositoryErrorCode.QUERY_EXECUTION,
//       cause,
//       entityName,
//       metadata,
//     })
//   }

//   static entityNotFoundError({
//     functionName,
//     message,
//     cause,
//     entityName,
//     identifier,
//     metadata,
//   }: Omit<RepositoryErrorDetails, "code">): RepositoryError {
//     return new RepositoryError({
//       functionName,
//       message,
//       code: RepositoryErrorCode.ENTITY_NOT_FOUND,
//       cause,
//       entityName,
//       identifier,
//       metadata,
//     })
//   }

//   static dataMappingError({
//     functionName,
//     message,
//     cause,
//     entityName,
//     metadata,
//   }: Omit<RepositoryErrorDetails, "code" | "identifier">): RepositoryError {
//     return new RepositoryError({
//       functionName,
//       message,
//       code: RepositoryErrorCode.DATA_MAPPING,
//       cause,
//       entityName,
//       metadata,
//     })
//   }

//   static validationError({
//     functionName,
//     message,
//     cause,
//     entityName,
//     metadata,
//   }: Omit<RepositoryErrorDetails, "code" | "identifier">): RepositoryError {
//     return new RepositoryError({
//       functionName,
//       message,
//       code: RepositoryErrorCode.VALIDATION,
//       cause,
//       entityName,
//       metadata,
//     })
//   }

//   // 데이터베이스 에러를 Repository 에러로 변환하는 팩토리 메서드
//   static fromDatabaseError({
//     error,
//     functionName,
//     entityName,
//   }: {
//     error: DatabaseError
//     functionName: string
//     entityName?: string
//   }): RepositoryError {
//     let repositoryError: RepositoryError

//     switch (error.code) {
//       case DatabaseErrorCode.RECORD_NOT_FOUND:
//         repositoryError = RepositoryError.entityNotFoundError({
//           functionName,
//           message: `엔티티를 찾을 수 없습니다${entityName ? `: ${entityName}` : ""}`,
//           cause: error,
//           entityName,
//         })
//         break
//       case DatabaseErrorCode.DATA_INTEGRITY_ERROR:
//         repositoryError = RepositoryError.validationError({
//           functionName,
//           message: `데이터 무결성 오류${entityName ? `(${entityName})` : ""}`,
//           cause: error,
//           entityName,
//         })
//         break
//       default:
//         repositoryError = RepositoryError.queryExecutionError({
//           functionName,
//           message: `데이터베이스 작업 중 오류 발생${entityName ? `(${entityName})` : ""}`,
//           cause: error,
//           entityName,
//           metadata: { originalCode: error.code },
//         })
//     }

//     return repositoryError
//   }

//   // 일반 에러를 Repository 에러로 변환하는 팩토리 메서드
//   static fromError({ error, functionName, entityName }: { error: unknown; functionName: string; entityName?: string }): RepositoryError {
//     if (error instanceof DatabaseError) {
//       return this.fromDatabaseError({ error, functionName, entityName })
//     }

//     if (error instanceof RepositoryError) {
//       return error
//     }

//     const message = error instanceof Error ? error.message : String(error)

//     return RepositoryError.queryExecutionError({
//       functionName,
//       message: `Repository 작업 중 예상치 못한 오류 발생: ${message}`,
//       cause: error,
//       entityName,
//     })
//   }
// }
