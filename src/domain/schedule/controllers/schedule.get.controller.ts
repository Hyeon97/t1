import { NextFunction, Response } from "express"
import { ControllerError } from "../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { SpecificScheduleFilterDTO } from "../dto/query/specific-schedule-filter.dto"
import { ScheduleResponseDTO } from "../dto/response/schedule-response.dto"
import { ScheduleService } from "../services/schedule.service"
import { ScheduleFilterOptions } from "../types/schedule-filter.type"
import { ScheduleQueryFilterDTO } from "./../dto/query/schedule-query-filter.dto"

export class ScheduleGetController extends BaseController {
  private readonly scheduleGetService: ScheduleService

  constructor({ scheduleGetService }: { scheduleGetService: ScheduleService }) {
    super({
      controllerName: "ScheduleGetController",
    })
    this.scheduleGetService = scheduleGetService
  }

  //  Schedule 조회 옵션 추출
  private extractFilterOptions({ query }: { query: ScheduleQueryFilterDTO | SpecificScheduleFilterDTO }): ScheduleFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: ScheduleFilterOptions = {
        //  필터
        type: query.type || "",
        state: query.state || "",
      }
      if (query instanceof SpecificScheduleFilterDTO) {
        filterOptions.identifierType = query.identifierType
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[Schedule 필터 옵션 추출] - 오류가 발생했습니다",
        error,
      })
    }
  }

  /**
   * 전체 스케쥴 조회
   */
  getSchedules = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getSchedules", state: "start" })

      // 필터 옵션 추출
      const query = req.query as unknown as ScheduleQueryFilterDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 서비스 호출
      const schedules = await this.scheduleGetService.getSchedules({ filterOptions })

      //  출력 가공
      const schedulesDTOs = ScheduleResponseDTO.fromEntities({ schedules })
      ContextLogger.info({ message: `총 ${schedulesDTOs.length}개의 Schedule 정보를 조회했습니다.` })
      ApiUtils.success({ res, data: schedulesDTOs, message: "Schedule infomation list" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getSchedules", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "getSchedules",
        message: "[Schedule 목록 조회] - 오류가 발생했습니다",
      })
    }
  }
}
