import { TransactionManager } from "../../database/connection"
import { RepositoryError } from "../../errors/repository/repository-error"
import { ServiceError } from "../../errors/service/service-error"
import { ContextLogger } from "../logger/logger.custom"

export class BaseService {
  protected readonly serviceName: string

  constructor({ serviceName }: { serviceName: string }) {
    this.serviceName = serviceName
  }

  /**
   * 서비스 에러 처리
   */
  protected handleServiceError({ error, functionName, message }: { error: unknown; functionName: string; message: string }): never {
    //  service 계층보다 더 아래인 계층에서 발생한 에러인 경우
    if (error instanceof RepositoryError) {
      throw ServiceError.fromRepositoryError({ error, functionName })
    }
    //  로깅
    ContextLogger.debug({
      message: `[Service-Layer] ${this.serviceName}.${functionName}() 오류 발생`,
      meta: {
        error: error instanceof Error ? error.message : String(error),
      },
    })
    //  service 계층에서 발생한 처리된 에러인 경우 그냥 상위 계층으로 전송
    if (error instanceof ServiceError) {
      throw error
    }
    //  그 외의 처리되지 않은 에러는 ServiceError로 변환하여 전송
    throw ServiceError.fromError({ error, functionName, message })
  }

  /**
   * 트랜잭션 실행
   */
  protected async executeTransaction<T>({
    callback,
  }: {
    callback: (transaction: TransactionManager) => Promise<T>
    operationName: string
  }): Promise<T> {
    try {
      return await TransactionManager.execute({ callback })
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "executeTransaction",
        message: `트랜잭션 실행 중 오류가 발생했습니다`,
      })
    }
  }

  // /**
  //  * 엔티티 존재 여부 확인 후 처리
  //  */
  // protected async ensureEntityExists<T>({
  //   entity,
  //   identifier,
  //   functionName,
  // }: {
  //   entity: T | null
  //   identifier: any
  //   functionName: string
  //   operationName: string
  // }): Promise<T> {
  //   if (!entity) {
  //     throw ServiceError.resourceNotFoundError({
  //       functionName,
  //       message: `${this.entityName}(${identifier})를 찾을 수 없습니다`,
  //       metadata: { identifier },
  //     })
  //   }
  //   return entity
  // }

  /**
   * 비즈니스 규칙 검증
   */
  protected validateBusinessRule({
    condition,
    message,
    functionName,
    metadata,
  }: {
    condition: boolean
    message: string
    functionName: string
    metadata?: Record<string, any>
  }): void {
    if (!condition) {
      throw ServiceError.businessRuleError({
        functionName,
        message,
        metadata,
      })
    }
  }
}
