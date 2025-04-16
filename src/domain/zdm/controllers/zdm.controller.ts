import { NextFunction, Response } from "express"
import { ControllerError } from "../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { stringToBoolean } from "../../../utils/data-convert.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { SpecificZdmFilterDTO } from "../dto/query/zdm/specific-zdm-query-filter.dto"
import { ZdmQueryFilterDTO } from "../dto/query/zdm/zdm-query-filter.dto"
import { ZdmResponseFactory } from "../dto/response/zdm-response-factory"
import { ZdmService } from "../services/zdm.service"
import { ZdmFilterOptions } from "../types/zdm/zdm-filter.type"

export class ZdmController extends BaseController {
  private readonly zdmService: ZdmService
  constructor({ zdmService }: { zdmService: ZdmService }) {
    super({
      controllerName: "ZdmController",
    })
    this.zdmService = zdmService
  }

  /**
   * zdm 조회 옵션 추출
   */
  private extractFilterOptions({ query }: { query: ZdmQueryFilterDTO | SpecificZdmFilterDTO }): ZdmFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: ZdmFilterOptions = {
        //  필터
        connection: query.connection || "",
        activation: query.activation || "",
        //  추가 정보
        network: query.network ?? false,
        disk: query.disk ?? false,
        partition: query.partition ?? false,
        repository: query.repository ?? false,
        zosRepository: query.zosRepository ?? false,
        //  상세 정보
        detail: query.detail ?? false,
      }

      if (query instanceof SpecificZdmFilterDTO) {
        filterOptions.identifierType = query.identifierType
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[ZDM 필터 옵션 추출] - 오류가 발생했습니다",
        error,
      })
    }
  }

  /**
   * zdm 전체 정보 조회
   */
  getZdms = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `ZDM 목록 조회 시작` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getZdms", state: "start" })

      // 필터 옵션 추출
      const query = req.query as unknown as ZdmQueryFilterDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 서비스 호출
      const zdmsData = await this.zdmService.getZdms({ filterOptions })

      //  출력 가공
      const zdmsDTOs = ZdmResponseFactory.createFromEntities({
        detail: stringToBoolean({ value: filterOptions?.detail }),
        zdmsData,
      })
      ContextLogger.info({ message: `총 ${zdmsData.length}개의 ZDM 정보를 조회했습니다. 상세 정보 포함: ${filterOptions.detail}` })
      ApiUtils.success({ res, data: zdmsDTOs, message: "ZDM infomation list" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getZdms", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "getZdms",
        message: "[ZDM 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 단일 zdm 정보 조회 ( id or Name )
   */
  getZdm = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `ZDM 정보 조회 시작` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getZdm", state: "start" })
      //  파라미터 추출
      const { identifier } = req.params
      const query = req.query as unknown as SpecificZdmFilterDTO
      const { identifierType } = query
      ContextLogger.debug({ message: `ZDM ${identifierType}로 정보 조회 요청: ${identifier}` })

      //  필터 옵션 추출
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      //  서비스 호출
      let zdmData
      if (filterOptions.identifierType === "id") {
        zdmData = await this.zdmService.getZdmById({
          id: identifier,
          filterOptions,
        })
      } else {
        zdmData = await this.zdmService.getZdmByName({
          name: identifier,
          filterOptions,
        })
      }

      //  출력 가공
      const zdmDTO = ZdmResponseFactory.createFromEntity({
        detail: stringToBoolean({ value: filterOptions?.detail }),
        zdmData,
      })
      ContextLogger.info({ message: `${identifierType}이(가) ${identifier}인 ZDM 정보 조회 완료. 상세 정보 포함: ${filterOptions.detail}` })
      ApiUtils.success({ res, data: zdmDTO, message: "ZDM information" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getZdm", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "getZdm",
        message: "[ZDM 정보 조회] - 오류가 발생했습니다",
      })
    }
  }
}
