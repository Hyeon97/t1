import { NextFunction, Request, Response } from "express"
import { v4 as uuidv4 } from "uuid"
import { ContextLogger } from "../../utils/logger/logger.custom"
import { asyncContextStorage } from "./AsyncContext"

export const asyncContextMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const id = uuidv4()
  const startTime = Date.now()

  // AsyncLocalStorage에 요청 ID와 시작 시간 저장
  asyncContextStorage.run(() => {
    ContextLogger.info({
      message: `Request received: ${req.method} ${req.url}`,
    })
    const store = asyncContextStorage.getContext()

    if (store) {
      // 요청 관련 정보 추가
      store.request!.method = req.method
      store.request!.url = req.url
      store.request!.query = req.query || null
      store.request!.body = req.body || null
      store.timestamp!.start = startTime
      store.task!.id = id
    }

    // 응답 완료 시 로깅 추가
    res.on("finish", () => {
      const endTime = Date.now()
      const duration = endTime - startTime
      if (store) {
        store.timestamp!.end = endTime
        store.timestamp!.duration = `${duration}ms`
        store.status = res.statusCode
      }
      ContextLogger.info({
        message: `Request completed: ${req.method} ${req.url} - Status: ${res.statusCode}, Duration: ${duration}ms`,
      })
      ContextLogger.info({
        message: JSON.stringify(store, null, 2),
      })
    })

    next()
  })
}
