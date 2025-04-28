import { ServiceError } from "../../../errors"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../utils/regex.utils"
import { ZdmGetService } from "../../zdm/services/common/zdm-get.service"
import { ScheduleRepository } from "../repositories/schedule-info"
import { ScheduleRegistRequestBody, ScheduleVerifiInput } from "../types/schedule-regist.type"
import { ScheduleVerifiService } from "./schedule-verify.service"

export class ScheduleRegistService extends BaseService {
  private readonly scheduleRepository: ScheduleRepository
  private readonly zdmGetService: ZdmGetService
  private readonly scheduleVerifiService: ScheduleVerifiService
  constructor({
    scheduleRepository,
    zdmGetService,
    scheduleVerifiService,
  }: {
    scheduleRepository: ScheduleRepository
    zdmGetService: ZdmGetService
    scheduleVerifiService: ScheduleVerifiService
  }) {
    super({
      serviceName: "ScheduleRegistService",
    })
    this.scheduleRepository = scheduleRepository
    this.zdmGetService = zdmGetService
    this.scheduleVerifiService = scheduleVerifiService
  }

  //  Schedule 등록
  async regist({ data }: { data: ScheduleRegistRequestBody }): Promise<any> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "regist", state: "start" })
      ContextLogger.debug({ message: "Schedule 정보 등록 시작", meta: { data } })
      let dbInputObject = null
      //  schedule 검증 ( type은 미들웨어 에서 검증됨 )
      const scheduleData: ScheduleVerifiInput = {
        full: data?.full,
        increment: data?.increment
      }
      dbInputObject = this.scheduleVerifiService.validateSchedule({ scheduleData, type: data.type })
      //  center 정보 가져오기
      let center = null
      //  ID 인 경우
      if (regNumberOnly.test(data.center)) {
        center = await this.zdmGetService.getZdmInfoById({ id: data.center })
      } else {
        // center 이름인 경우
        center = await this.zdmGetService.getZdmInfoByName({ name: data.center })
      }
      if (!center) {
        throw ServiceError.badRequest(ServiceError, {
          method: "regist",
          message: "[Schedule 정보 등록] - 일치하는 ZDM 정보 없음.",
        })
      }

      //  등록
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
