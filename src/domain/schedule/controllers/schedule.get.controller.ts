import { NextFunction, Response } from "express"
import { ControllerError } from "../../../errors"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ScheduleQueryFilterDTO } from "../dto/query/schedule-query-filter.dto"
import { SpecificScheduleFilterDTO } from "../dto/query/specific-schedule-filter.dto"
import { ScheduleResponseDTO } from "../dto/response/schedule-response.dto"
import { ScheduleService } from "../services/schedule.service"
import { ScheduleFilterOptions } from "../types/schedule-filter.type"

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
   * 공통 Schedule 조회 핸들러
   */
  private async handleScheduleGet<T>({
    req, res, next,
    methodName,
    paramExtractor,
    errorMessage,
    serviceMethod,
  }: {
    req: ExtendedRequest
    res: Response
    next: NextFunction
    methodName: string
    errorMessage: string
    paramExtractor?: (params: any) => { jobName?: string }
    serviceMethod: (params: any) => Promise<any>
  }): Promise<void> {
    try {
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getSchedules", state: "start" })

      // 필터 옵션 추출
      const query = req.query as unknown as ScheduleQueryFilterDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 파라미터 추출 (필요한 경우)
      let identifier = {}
      if (paramExtractor) {
        const params = req.params as unknown as T
        identifier = paramExtractor(params)
        ContextLogger.debug({ message: `[식별자]`, meta: identifier })
      }

      // 서비스 호출
      const schedules = await serviceMethod({ ...identifier, filterOptions, })

      //  출력 가공
      const schedulesDTOs = ScheduleResponseDTO.fromEntities({ schedules })

      ContextLogger.info({ message: `총 ${schedulesDTOs.length}개의 Schedule 정보를 조회했습니다.` })
      ApiUtils.success({ res, data: schedulesDTOs, message: "Schedule infomation list" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getSchedules", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: methodName,
        message: errorMessage,
      })
    }
  }

  /**
   * 전체 스케쥴 조회
   */
  getSchedules = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleScheduleGet({
      req, res, next,
      methodName: "getSchedules",
      errorMessage: "[Schedule 목록 조회] - 예기치 못한 오류 발생",
      serviceMethod: ({ filterOptions }) => this.scheduleGetService.getSchedules({ filterOptions }),
    })
  }
}
