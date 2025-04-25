import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ScheduleRepository } from "../repositories/schedule-info"
import { ScheduleRegistRequestBody } from "../types/schedule-regist.type"

export class ScheduleRegistService extends BaseService {
  private readonly scheduleRepository: ScheduleRepository

  constructor({ scheduleRepository }: { scheduleRepository: ScheduleRepository }) {
    super({
      serviceName: "ScheduleRegistService",
    })
    this.scheduleRepository = scheduleRepository
  }

  //  Schedule 검증
  //  Schedule 등록
  async regist({ data }: { data: ScheduleRegistRequestBody }): Promise<any> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "regist", state: "start" })
      ContextLogger.debug({ message: "Schedule 정보 등록 시작", meta: { data } })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "regist", state: "end" })
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "regist",
        message: `[Schedule 정보 등록] - 오류가 발생했습니다`,
      })
    }

  }
}