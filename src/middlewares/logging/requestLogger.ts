import { NextFunction } from "express"
import { v4 as uuidv4 } from "uuid"
import { logger } from "../../utils/logger/logger.util"
import { asyncLocalStorage } from "../../utils/asyncContext"

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = uuidv4()
  const startTime = Date.now()

  logger.info(`Request received`, {
    requestId,
    method: req.method,
    url: req.url,
  })

  // //  응답 완료
  // res.on("finish", () => {
  //   const duration = Date.now() - startTime
  //   logger.info(`Request completed`, {
  //     requestId,
  //     method: req.method,
  //     status: res.statusCode,
  //     duration: `${duration}ms`,
  //   })
  // })

  //  AsyncLocalStorage에 요청 ID와 시작 시간 저장
  asyncLocalStorage.run({ requestId, startTime }, () => {
    next()
  })
}
