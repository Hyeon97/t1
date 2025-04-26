import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { ZdmRepository } from "../../zdm/repositories/center-info.repository"
import { ScheduleRepository } from "../repositories/schedule-info"
import { ScheduleFilterOptions } from "../types/schedule-filter.type"
import { ScheduleDataResponse } from "../types/schedule-response.type"

export class ScheduleGetService extends BaseService {
  private readonly scheduleRepository: ScheduleRepository
  private readonly zdmRepository: ZdmRepository
  constructor({ scheduleRepository, zdmRepository }: { scheduleRepository: ScheduleRepository; zdmRepository: ZdmRepository }) {
    super({
      serviceName: "ScheduleGetService",
    })
    this.scheduleRepository = scheduleRepository
    this.zdmRepository = zdmRepository
  }

  /**
   * 모든 Schedule 조회
   */
  async getSchedules({ filterOptions }: { filterOptions?: ScheduleFilterOptions }): Promise<ScheduleDataResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getSchedules", state: "start" })

      // 스케줄 정보 조회
      const schedules = await this.scheduleRepository.findAll({ filterOptions })

      // 모든 고유한 센터 ID 추출
      const centerIds = [...new Set(schedules.map((schedule) => schedule.nCenterID))]

      // 모든 필요한 센터 정보 조회
      const centers = await this.zdmRepository.findByZdmIds({ ids: centerIds })

      // 센터 ID를 키로 하는 맵 생성
      const centerMap = new Map(centers.map((center) => [center.nID, center]))

      // 스케줄과 센터 정보 결합
      const schedulesWithCenter = schedules.map((schedule) => ({
        schedule,
        center: centerMap.get(schedule.nCenterID)!,
      }))

      asyncContextStorage.addOrder({ component: this.serviceName, method: "getSchedules", state: "end" })
      return { items: schedulesWithCenter }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getSchedules",
        message: `[Schedule 정보 조회] - 오류가 발생했습니다`,
      })
    }
  }
}
