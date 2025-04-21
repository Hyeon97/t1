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
    method,
  }: {
    error: unknown
    next: NextFunction
    message: string
    method: string
  }): void => {
    const application = this.controllerName
    //  Repository, Service Layer에서 발생한 1error는 바로 상위 계층으로
    if (error instanceof RepositoryError || error instanceof ServiceError) {
      next(error)
    }
    //  Controller Layer에서 발생한 에러만 로깅
    else if (error instanceof Error && error instanceof ControllerError) {
      //  에러가 발생한 Controller Layer Application이름 주입
      if (error?.metadata) {
        error.metadata.application = application
      }
      //  로깅
      ContextLogger.info({
        message: `[Controller-Layer] ${this.controllerName} () 오류 발생`,
        meta: { error: error instanceof Error ? error.message : String(error) },
      })
      //  Controller Layer에서 발생한 정의되지 않은 오류 처리
    } else if (error instanceof Error && !(error instanceof ControllerError)) {
      error = ControllerError.fromError<ControllerError>(error, { error, method, message, application })
    }
    next(error)
  }
}
