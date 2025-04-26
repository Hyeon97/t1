import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { ScheduleRepository } from "../repositories/schedule-info"
import { ScheduleFilterOptions } from "../types/schedule-filter.type"
import { ScheduleDataResponse } from "../types/schedule-response.type"

export class ScheduleGetService extends BaseService {
  private readonly scheduleRepository: ScheduleRepository
  constructor({ scheduleRepository }: { scheduleRepository: ScheduleRepository }) {
    super({
      serviceName: "ScheduleGetService",
    })
    this.scheduleRepository = scheduleRepository
  }

  /**
   * 모든 Schedule 조회
   */
  async getSchedules({ filterOptions }: { filterOptions?: ScheduleFilterOptions }): Promise<ScheduleDataResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getSchedules", state: "start" })

      //  Schedule 정보 조회
      const schedules = await this.scheduleRepository.findAll({ filterOptions })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getSchedules", state: "end" })
      return { items: schedules }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getSchedules",
        message: `[Schedule 정보 조회] - 오류가 발생했습니다`,
      })
    }
  }
}
