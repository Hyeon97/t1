import { NextFunction, Request, Response } from "express"
import { asyncContextStorage } from "../../utils/AsyncContext"
import { ContextLogger } from "../../utils/logger/logger.custom"

export const asyncContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // AsyncLocalStorage에 요청 ID와 시작 시간 저장
  asyncContextStorage.run(() => {
    ContextLogger.info({
      message: `Request received: ${req.method} ${req.url}`,
    })

    // 응답 완료 시 로깅 추가
    res.on("finish", () => {
      asyncContextStorage.complete({ status: res.statusCode })
      const timestamp = asyncContextStorage.getTimestampInfo()
      ContextLogger.info({
        message: `Request completed: ${req.method} ${req.url} - Status: ${res.statusCode}, Duration: ${timestamp!.duration}`,
      })
      const context = asyncContextStorage.getContext()
      // ContextLogger.debug({
      //   message: JSON.stringify(context, null, 2),
      // })
    })

    next()
  }, req)
}
