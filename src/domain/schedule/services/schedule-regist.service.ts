import { ServiceError } from "../../../errors"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { jobUtils } from "../../../utils/job/job.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../utils/regex.utils"
import { UserService } from "../../user/services/user.service"
import { ZdmGetService } from "../../zdm/services/common/zdm-get.service"
import { ScheduleRepository } from "../repositories/schedule-info"
import { ScheduleRegistRequestBody, ScheduleVerifiInput } from "../types/schedule-regist.type"
import { ScheduleVerifiService } from "./schedule-verify.service"

export class ScheduleRegistService extends BaseService {
  private readonly scheduleRepository: ScheduleRepository
  private readonly zdmGetService: ZdmGetService
  private readonly userService: UserService
  private readonly scheduleVerifiService: ScheduleVerifiService
  constructor({
    scheduleRepository,
    zdmGetService,
    userService,
    scheduleVerifiService,
  }: {
    scheduleRepository: ScheduleRepository
    zdmGetService: ZdmGetService
    userService: UserService
    scheduleVerifiService: ScheduleVerifiService
  }) {
    super({
      serviceName: "ScheduleRegistService",
    })
    this.scheduleRepository = scheduleRepository
    this.zdmGetService = zdmGetService
    this.userService = userService
    this.scheduleVerifiService = scheduleVerifiService
  }

  /**
   * User 정보 가져오기
   */
  private async getUser({ user }: { user: string }) {
    asyncContextStorage.addOrder({ component: this.serviceName, method: "getUser", state: "start" })
    //  user 정보가 email 경우( token에서 자동 추출이 아닌 시용자 입력으로 간주 ) > DB에서 검색 후 정보 가져와야 함
    if (!regNumberOnly.test(user)) {
      return String((await this.userService.getUserByEmail({ email: user })).idx)
    }
    asyncContextStorage.addOrder({ component: this.serviceName, method: "getUser", state: "end" })
    return user
  }

  /**
   * center 정보 가져오기
   */
  private async setCenterInfo({ center }: { center: string }) {
    asyncContextStorage.addOrder({ component: this.serviceName, method: "setCenterInfo", state: "start" })
    //  center 정보 가져오기
    let centerInfo = null
    //  ID 인 경우
    if (regNumberOnly.test(center)) {
      centerInfo = await this.zdmGetService.getZdmInfoById({ id: center })
    } else {
      // center 이름인 경우
      centerInfo = await this.zdmGetService.getZdmInfoByName({ name: center })
    }
    if (!centerInfo) {
      throw ServiceError.badRequest(ServiceError, {
        method: "regist",
        message: "[Schedule 정보 등록] - 일치하는 ZDM 정보 없음.",
      })
    }
    asyncContextStorage.addOrder({ component: this.serviceName, method: "setCenterInfo", state: "end" })
    return centerInfo
  }

  /**
   * ID 자동 생성
   */
  //  full, increment용
  private async setID(): Promise<number> {
    asyncContextStorage.addOrder({ component: this.serviceName, method: "setID", state: "start" })
    const id = await jobUtils.getRandomNumber({
      checkExists: async (id) => (await this.scheduleRepository.findById({ id })).length > 0
    })
    asyncContextStorage.addOrder({ component: this.serviceName, method: "setID", state: "end" })
    return id
  }
  //  smart용
  private async setIDPair(): Promise<[number, number]> {
    asyncContextStorage.addOrder({ component: this.serviceName, method: "setIDPair", state: "start" })
    // 첫 번째 ID 생성
    const firstID = await this.setID()

    // 두 번째 ID 생성 (첫 번째 ID와 겹치지 않도록)
    const secondID = await jobUtils.getRandomNumber({
      checkExists: async (id) =>
        id === firstID || (await this.scheduleRepository.findById({ id })).length > 0
    })

    asyncContextStorage.addOrder({ component: this.serviceName, method: "setIDPair", state: "end" })
    return [firstID, secondID]
  }

  /**
   * Schedule 등록
   */
  private async registScheduleDataSet({ data, type }: { data: any, type: number }) {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "registScheduleDataSet", state: "start" })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "registScheduleDataSet", state: "end" })
    } catch (error) {
      throw ServiceError.dataProcessingError({
        method: "registerBackupDataSet",
        message: "[Schedule 정보 등록] - Schedule 정보 DB등록 중 오류 발생",
        error,
      })
    }
  }

  /**
   * Schedule 등록
   */
  async regist({ data }: { data: ScheduleRegistRequestBody }): Promise<any> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "regist", state: "start" })
      ContextLogger.debug({ message: "Schedule 정보 등록 시작", meta: { data } })

      //  User 정보 가져오기 + 할당
      //  User 정보는 controller 단에서 무조선 존재함
      const user = await this.getUser({ user: data.user! })
      data.user = user

      //  schedule 검증 ( type은 미들웨어 에서 검증됨 )
      const scheduleData: ScheduleVerifiInput = {
        full: data?.full,
        increment: data?.increment
      }
      const scheduleType = Number(data.type)
      const { processedData, scheduleMode } = this.scheduleVerifiService.validateSchedule({ scheduleData, type: scheduleType })

      //  center 정보 가져오기
      const center = await this.setCenterInfo({ center: data.center })

      //  최종 데이터 셋 생성
      if (scheduleMode === 'smart') {
        //  id 할당
        const [fullID, incID] = await this.setIDPair()
        processedData['full'].nID = fullID
        processedData['increment'].nID = incID
        //  center id 할당
        processedData['full'].nCenterID = center.nID
        processedData['increment'].nCenterID = center.nID
        //  user id 할당
        processedData['full'].nUserID = data.user
        processedData['increment'].nUserID = data.user
        //  jobName 할당
        processedData['full'].sjobName = data?.jobName || ''
        processedData['increment'].sjobName = data?.jobName || ''
      }
      else {
        //  id 할당
        processedData[scheduleMode].nID = await this.setID()
        //  center id 할당
        processedData[scheduleMode].nCenterID = center.nID
        //  user id 할당
        processedData[scheduleMode].nUserID = data.user
        //  jobName 할당
        processedData[scheduleMode].sjobName = data?.jobName || ''
      }

      console.dir(processedData, { depth: null })
      //  등록
      await this.registScheduleDataSet({ data: processedData, type: data.type })

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
