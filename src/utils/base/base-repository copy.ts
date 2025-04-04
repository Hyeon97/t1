// /////////////////////////////////////////////////////////////
// //  repository 공통 ( DB와 상호작용하는 repository를 의미 )  //
// /////////////////////////////////////////////////////////////

// import { DatabaseOperations } from "../../database/connection"
// import { DatabaseError } from "../../errors/database/database-error"
// import { RepositoryError } from "../../errors/repository/repository-error"
// import { ContextLogger } from "../logger/logger.custom"

// export class BaseRepository {
//   protected readonly tableName: string
//   protected query: string = ""
//   protected params: any[] = []
//   protected conditions: string[] = []
//   protected readonly entityName: string

//   constructor({ tableName, entityName }: { tableName: string; entityName: string }) {
//     this.tableName = tableName  //  repository에서 사용할 table 이름
//     this.entityName = entityName  //  repository에서 사용할 객체 이름
//   }

//   /**
//    * 쿼리 상태 초기화
//    */
//   protected resetQueryState(): void {
//     this.query = ""
//     this.params = []
//     this.conditions = []
//   }

//   /**
//    * WHERE 절에 조건 추가
//    */
//   protected addCondition({ condition, params }: { condition: string; params: any[] }): void {
//     this.conditions.push(condition)
//     this.params.push(...params)
//   }

//   /**
//    * WHERE 절에 원시 조건 추가 (파라미터 없음)
//    */
//   protected addRawCondition({ condition }: { condition: string }): void {
//     this.conditions.push(condition)
//   }

//   /**
//    * WHERE 절 생성
//    */
//   protected buildWhereClause(): string {
//     if (this.conditions.length === 0) {
//       return ""
//     }
//     return ` WHERE ${this.conditions.join(" AND ")}`
//   }

//   /**
//    * 데이터베이스 쿼리 실행
//    */
//   protected async executeQuery<T>({ sql, params = [] }: { sql: string; params?: any[] }): Promise<T[]> {
//     try {
//       return await DatabaseOperations.executeQuery<T>({ sql, params })
//     } catch (error) {
//       if (error instanceof DatabaseError) {
//         throw RepositoryError.fromDatabaseError({
//           error,
//           functionName: "executeQuery",
//           entityName: this.entityName,
//         })
//       }

//       throw RepositoryError.fromError({
//         error,
//         functionName: "executeQuery",
//         entityName: this.entityName,
//       })
//     }
//   }

//   /**
//    * 데이터베이스 단일 레코드 쿼리 실행
//    */
//   protected async executeQuerySingle<T>({
//     sql,
//     params = [],
//     functionName,
//   }: {
//     sql: string
//     params?: any[]
//     functionName: string
//   }): Promise<T | null> {
//     try {
//       const result = await DatabaseOperations.executeQuerySingle<T>({ sql, params })

//       return result
//     } catch (error) {
//       if (error instanceof DatabaseError) {
//         throw RepositoryError.fromDatabaseError({
//           error,
//           functionName,
//           entityName: this.entityName,
//         })
//       }

//       if (error instanceof RepositoryError) {
//         throw error
//       }

//       throw RepositoryError.fromError({
//         error,
//         functionName,
//         entityName: this.entityName,
//       })
//     }
//   }

//   /**
//    * 데이터베이스 에러 로깅 및 변환
//    */
//   protected handleRepositoryError({
//     error,
//     functionName,
//     message = "Repository 작업 중 오류가 발생했습니다",
//   }: {
//     error: unknown
//     functionName: string
//     message?: string
//   }): never {
//     //  로깅
//     ContextLogger.error({
//       // message: `${functionName} 함수에서 Repository 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
//       message: `[Repository-Error] ${functionName}() 오류 발생: ${error instanceof Error ? error.message : String(error)}`,
//       meta: {
//         entity: this.entityName,
//         error,
//       },
//     })
//     //  repository 계층보다 더 아래인 DB 계층에서 발생한 에러인 경우
//     if (error instanceof DatabaseError) {
//       throw RepositoryError.fromDatabaseError({
//         error,
//         functionName,
//         entityName: this.entityName,
//       })
//     }

//     //  Repository 계층에서 발생한 에러인 경우 그냥 상위 계층으로 전송
//     if (error instanceof RepositoryError) {
//       throw error
//     }

//     throw RepositoryError.fromError({
//       error,
//       functionName,
//       entityName: this.entityName,
//     })
//   }
// }
