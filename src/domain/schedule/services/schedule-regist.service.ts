import { ServiceError } from "../../../errors"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../utils/regex.utils"
import { ZdmGetService } from "../../zdm/services/common/zdm-get.service"
import { ScheduleRepository } from "../repositories/schedule-info"
import { ScheduleRegistRequestBody } from "../types/schedule-regist.type"
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

  //  Schedule 검증
  private validateScheduleConstraints({ data }: { data: ScheduleRegistRequestBody }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "validateScheduleConstraints", state: "start" })
      console.log("====================")
      console.dir(data, { depth: null })
      console.log("====================")
      //  기본 검증(1) - full, increment 객체 유무 확인
      if (!data?.full && !data?.increment) {
        throw ServiceError.badRequest(ServiceError, {
          method: "validateScheduleConstraints",
          message: `[Schedule 정보 등록] - Schedule data 에러. full 또는 increment 중 하나 이상 존재 해야함.`,
          metadata: {},
        })
      }
      //  기본 검증(2) - schedule type에 따른 full, increment 객체 유무 확인
      //  type이 7이상 > smart > full, increment 둘다 존재 해야함
      if (data.type >= 7 && !(data?.full && data?.increment)) {
        throw ServiceError.badRequest(ServiceError, {
          method: "validateScheduleConstraints",
          message: `[Schedule 정보 등록] - Schedule data 에러. smart schedule인 경우 full, increment 모두 존재 해야함.`,
          metadata: {},
        })
      }
      let dbInputObject = null
      //  타입별 검증 시작
      const scheduleData = data.full || data.increment
      dbInputObject = this.scheduleVerifiService.validateSchedule({ data: scheduleData!, type: data.type })

      console.log("====================")
      console.log("dbInputObject")
      console.dir(dbInputObject, { depth: null })
      console.log("====================")

      asyncContextStorage.addOrder({ component: this.serviceName, method: "validateScheduleConstraints", state: "end" })
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "validateScheduleConstraints",
        message: "[Schedule 정보 등록] - Schedule data 검증 중 오류 발생",
      })
    }
  }
  //  Schedule 등록
  async regist({ data }: { data: ScheduleRegistRequestBody }): Promise<any> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "regist", state: "start" })
      ContextLogger.debug({ message: "Schedule 정보 등록 시작", meta: { data } })
      //  schedule 검증 ( type은 미들웨어 에서 검증됨 )
      await this.validateScheduleConstraints({ data })
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
