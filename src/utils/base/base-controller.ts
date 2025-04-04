import { NextFunction } from "express"
import { ControllerError } from "../../errors/controller/controller-error"
import { ContextLogger } from "../logger/logger.custom"

export class BaseController {
  protected readonly controllerName: string
  protected readonly entityName: string

  constructor({ controllerName, entityName }: { controllerName: string; entityName: string }) {
    this.controllerName = controllerName
    this.entityName = entityName
  }

  /**
  * 컨트롤러 에러 처리
  */
  protected handleControllerError = ({
    error,
    next,
    functionName,
    resource,
    action
  }: {
    error: unknown
    next: NextFunction
    functionName: string
    resource?: string
    action?: string
  }): void => {
    ContextLogger.debug({
      message: `[Controller-Layer] ${this.controllerName}.${functionName}() 오류 발생`,
      meta: { functionName, resource, action, error: error instanceof Error ? error.message : String(error) }
    })

    next(ControllerError.fromError({
      error,
      functionName,
      resource,
      action
    }))
  }
}