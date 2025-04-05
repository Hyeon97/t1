import { NextFunction } from "express"
import { ControllerError } from "../../errors/controller/controller-error"
import { ContextLogger } from "../logger/logger.custom"
import { ServiceError } from "../../errors/service/service-error"

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
    message,
  }: {
    error: unknown
    next: NextFunction
    functionName: string
    message: string
  }): void => {
    //  controller 계층보다 더 아래인 계층에서 발생한 에러인 경우
    if (error instanceof ServiceError) {
      throw ControllerError.fromServiceError({ error, functionName })
    }
    //  로깅
    ContextLogger.debug({
      message: `[Controller-Layer] ${this.controllerName}.${functionName}() 오류 발생`,
      meta: { error: error instanceof Error ? error.message : String(error) },
    })
    //  controller 계층에서 발생한 처리된 에러인 경우 그냥 상위 계층으로 전송
    if (error instanceof ControllerError) {
      next(error)
      return
    }
    //  그 외의 처리되지 않은 에러는 ControllerError로 변환하여 전송
    next(ControllerError.fromError({ error, functionName, message }))
  }
}
