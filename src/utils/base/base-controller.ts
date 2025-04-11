import { NextFunction } from "express"
import { RepositoryError, ServiceError } from "../../errors"
import { ControllerError } from "../../errors/controller/controller-error"
import { ContextLogger } from "../logger/logger.custom"

export class BaseController {
  protected readonly controllerName: string

  constructor({ controllerName }: { controllerName: string }) {
    this.controllerName = controllerName
  }

  /**
   * Controller 에러 처리
   */
  protected handleControllerError = ({
    error,
    next,
    message,
    method
  }: {
    error: unknown
    next: NextFunction
    message: string
    method: string
  }): void => {
    //  repository, service error는 바로 상위 계층으로
    if (error instanceof RepositoryError || error instanceof ServiceError) {
      next(error)
    }

    //  controller layer에서 발생한 에러만 로깅
    if (error instanceof ControllerError) {
      ContextLogger.debug({
        message: `[Controller-Layer] ${this.controllerName} () 오류 발생`,
        meta: { error: error instanceof Error ? error.message : String(error) },
      })
    }
    else if (error instanceof Error && !(error instanceof ControllerError)) {
      error = ControllerError.fromError<ControllerError>(error, { method, message })
    }
    //  그외 계층에서 발생한 에러는 바로 상위 계층으로 전송
    next(error)
  }
}
