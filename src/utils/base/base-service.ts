import { TransactionManager } from "../../database/connection"
import { RepositoryError } from "../../errors/repository/repository-error"
import { ServiceError } from "../../errors/service/service-error"
import { ContextLogger } from "../logger/logger.custom"

export class BaseService {
  protected readonly serviceName: string
  protected readonly entityName: string

  constructor({ serviceName, entityName }: { serviceName: string; entityName: string }) {
    this.serviceName = serviceName
    this.entityName = entityName
  }

  /**
   * 트랜잭션 실행
   */
  protected async executeTransaction<T>({
    callback,
    operationName
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
        operationName,
        message: `트랜잭션 실행 중 오류가 발생했습니다`
      })
    }
  }

  /**
   * 서비스 에러 처리
   */
  protected handleServiceError({
    error,
    functionName,
    operationName,
    message = "서비스 작업 중 오류가 발생했습니다"
  }: {
    error: unknown
    functionName: string
    operationName: string
    message?: string
  }): never {
    ContextLogger.debug({
      message: `[Service-Layer] ${this.serviceName}.${functionName}() 오류 발생`,
      meta: {
        entity: this.entityName,
        operation: operationName,
        error: error instanceof Error ? error.message : String(error)
      }
    })

    if (error instanceof RepositoryError) {
      throw ServiceError.fromRepositoryError({
        error,
        functionName,
        operationName
      })
    }

    if (error instanceof ServiceError) {
      throw error
    }

    throw ServiceError.fromError({
      error,
      functionName,
      operationName,
      entityName: this.entityName
    })
  }

  /**
   * 엔티티 존재 여부 확인 후 처리
   */
  protected async ensureEntityExists<T>({
    entity,
    identifier,
    functionName,
    operationName
  }: {
    entity: T | null
    identifier: any
    functionName: string
    operationName: string
  }): Promise<T> {
    if (!entity) {
      throw ServiceError.resourceNotFoundError({
        functionName,
        message: `${this.entityName}(${identifier})를 찾을 수 없습니다`,
        entityName: this.entityName,
        operationName,
        metadata: { identifier }
      })
    }
    return entity
  }

  /**
   * 비즈니스 규칙 검증
   */
  protected validateBusinessRule({
    condition,
    message,
    functionName,
    operationName,
    metadata
  }: {
    condition: boolean
    message: string
    functionName: string
    operationName: string
    metadata?: Record<string, any>
  }): void {
    if (!condition) {
      throw ServiceError.businessRuleError({
        functionName,
        message,
        entityName: this.entityName,
        operationName,
        metadata
      })
    }
  }
}