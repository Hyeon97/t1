import { BaseController } from "../../../utils/base/base-controller"

export class ScheduleController extends BaseController {
  private readonly scheduleService: ScheduleService
  constructor({ scheduleService }: { scheduleService: ScheduleService }) {
    super({
      controllerName: "ScheduleController",
    })
    this.scheduleService = scheduleService
  }
}