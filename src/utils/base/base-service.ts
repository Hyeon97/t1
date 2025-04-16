import { TransactionManager } from "../../database/connection"
import { DatabaseError, RepositoryError, UtilityError } from "../../errors"
import { ServiceError } from "../../errors/service/service-error"
import { ContextLogger } from "../logger/logger.custom"

export class BaseService {
  protected readonly serviceName: string

  constructor({ serviceName }: { serviceName: string }) {
    this.serviceName = serviceName
  }

  /**
   * Service 에러 처리
   */
  protected handleServiceError({ error, method, message }: { error: unknown; method: string; message: string }): never {
    //  repository or database error는 바로 상위 계층으로
    if (error instanceof RepositoryError || error instanceof DatabaseError || error instanceof UtilityError) {
      throw error
    }

    //  service layer에서 발생한 에러만 로깅
    if (error instanceof Error && error instanceof ServiceError) {
      ContextLogger.info({
        message: `[Service-Layer] ${this.serviceName}.${method}() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      //  일반 에러인 경우 Service 에러로 변경
    } else if (error instanceof Error && !(error instanceof ServiceError)) {
      error = ServiceError.fromError<ServiceError>(error, { method, message })
    }
    throw error
  }

  /**
   * 트랜잭션 실행
   */
  protected async executeTransaction<T>({ callback }: { callback: (transaction: TransactionManager) => Promise<T> }): Promise<T> {
    try {
      return await TransactionManager.execute({ callback })
    } catch (error) {
      if (error instanceof Error && error instanceof ServiceError) {
        throw error
      }
      if (error instanceof Error && error instanceof RepositoryError) {
        const msg = error?.message ?? `트랜잭션 실행 중 오류가 발생했습니다`
        throw ServiceError.transactionError({
          method: "executeTransaction",
          message: msg,
          cause: error,
        })
      }
      throw error
      // return this.handleServiceError({
      //   error,
      //   method: "executeTransaction",
      //   message: `트랜잭션 실행 중 오류가 발생했습니다`,
      // })
    }
  }

  // /**
  //  * 엔티티 존재 여부 확인 후 처리
  //  */
  // protected async ensureEntityExists<T>({
  //   entity,
  //   identifier,
  //   method,
  // }: {
  //   entity: T | null
  //   identifier: any
  //   method: string
  //   operationName: string
  // }): Promise<T> {
  //   if (!entity) {
  //     throw ServiceError.resourceNotFoundError({
  //       method,
  //       message: `${this.entityName}(${identifier})를 찾을 수 없습니다`,
  //       metadata: { identifier },
  //     })
  //   }
  //   return entity
  // }

  // /**
  //  * 비즈니스 규칙 검증
  //  */
  // protected validateBusinessRule({
  //   condition,
  //   message,
  //   method,
  //   metadata,
  // }: {
  //   condition: boolean
  //   message: string
  //   method: string
  //   metadata?: Record<string, any>
  // }): void {
  //   if (!condition) {
  //     throw ServiceError.businessRuleError({
  //       method,
  //       message,
  //       metadata,
  //     })
  //   }
  // }
}
