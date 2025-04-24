import { BaseService } from "../../../utils/base/base-service"
import { ScheduleRepository } from "../repositories/schedule-info"

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
}