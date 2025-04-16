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
    const application = this.serviceName
    //  Repository, Database Layer에서 발생한 error는 바로 상위 계층으로
    if (error instanceof RepositoryError || error instanceof DatabaseError || error instanceof UtilityError) {
      throw error
    }

    //  Service layer에서 발생한 에러만 로깅
    if (error instanceof Error && error instanceof ServiceError) {
      //  에러가 발생한 Service Layer Application이름 주입
      if (error?.metadata) { error.metadata.application = application }
      //  로깅
      ContextLogger.info({
        message: `[Service-Layer] ${this.serviceName}.${method}() 오류 발생`,
        meta: { error: error instanceof Error ? error.message : String(error), },
      })
      //  Service Layer에서 발생한 정의되지 않은 오류 처리
    } else if (error instanceof Error && !(error instanceof ServiceError)) {
      error = ServiceError.fromError<ServiceError>(error, { error, method, message, application })
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
      if (error instanceof Error && error instanceof RepositoryError) {
        const msg = error?.message ?? `트랜잭션 실행 중 오류가 발생했습니다`
        throw ServiceError.transactionError({
          method: "executeTransaction",
          message: msg,
          error,
        })
      }
      else if (error instanceof Error && error instanceof ServiceError) {
        // console.log(`executeTransaction-error`)
        throw error
      }
      else { throw error }
    }
  }
}
