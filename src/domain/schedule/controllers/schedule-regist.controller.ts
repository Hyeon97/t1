import { NextFunction, Response } from "express"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ScheduleRegistService } from "../services/shcedule-regist.service"
import { ScheduleRegistRequestBody } from "../types/schedule-regist.type"

export class ScheduleRegistController extends BaseController {
  private readonly scheduleRegistService: ScheduleRegistService

  constructor({ scheduleRegistService }: { scheduleRegistService: ScheduleRegistService }) {
    super({
      controllerName: "ScheduleRegistController",
    })
    this.scheduleRegistService = scheduleRegistService
  }

  /**
   * Schedule 등록
   */
  regist = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `Schedule 정보 등록 시작` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "regist", state: "start" })

      //  body data 추출
      const data = req.body as ScheduleRegistRequestBody

      //  서비스 호출
      const resultData = await this.scheduleRegistService.regist({ data })

      //  출력 가공
      ApiUtils.success({ res, data: resultData, message: "Schedule data regist result" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "regist", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "regist",
        message: "Schedule 정보 등록 - 오류가 발생했습니다",
      })
    }
  }
}