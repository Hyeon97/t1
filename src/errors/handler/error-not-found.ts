import { NextFunction, Request, Response } from "express"
import { ContextLogger } from "../../utils/logger/logger.custom"
import { ApiError } from "../ApiError"
import { ErrorLayer } from "../error-types"

/**
 * 404 Not Found 핸들러
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const message = `리소스를 찾을 수 없습니다: ${req.originalUrl}`
  ContextLogger.warn({
    message: `[404] ${message} - ${req.method}`,
    meta: { url: req.originalUrl },
  })
  // 404 에러 생성
  const error = ApiError.notFound(undefined, { functionName: "notFoundHandler", message, layer: ErrorLayer.MIDDLEWARE })
  // ControllerError.resourceNotFoundError({
  //   functionName: "notFoundHandler",
  //   message,
  //   metadata: { url: req.originalUrl }
  // })

  next(error)
}
