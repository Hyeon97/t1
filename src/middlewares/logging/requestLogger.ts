import { NextFunction, Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { asyncLocalStorage } from "../../utils/asyncContext"
import { ContextLogger } from "../../utils/logger/logger.custom"

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = uuidv4()
  const startTime = Date.now()

  // AsyncLocalStorage에 요청 ID와 시작 시간 저장
  asyncLocalStorage.run({ requestId, startTime }, () => {
    ContextLogger.info({
      message: `Request received: ${req.method} ${req.url}`
    })

    // 응답 완료 시 로깅 추가
    res.on("finish", () => {
      const duration = Date.now() - startTime
      ContextLogger.info({
        message: `Request completed: ${req.method} ${req.url} - Status: ${res.statusCode}, Duration: ${duration}ms`
      })
    })

    next()
  })
}