import { NextFunction, Response } from "express"
import { ZdmError } from "../../../errors/domain-errors/ZdmError"
import { handleControllerError } from "../../../errors/handler/integration-error-handler"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { stringToBoolean } from "../../../utils/data-convert.util"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ZdmQueryFilterDTO } from "../dto/query/zdm/zdm-query-filter.dto"
import { ZdmResponseFactory } from "../dto/response/zdm-response-factory"
import { ZdmFilterOptions } from "../types/zdm/zdm-filter.type"
import { ZdmService } from "../services/zdm.service"

export class ZdmController {
  private readonly zdmService: ZdmService
  constructor({ zdmService }: { zdmService: ZdmService }) {
    this.zdmService = zdmService
  }

  /**
   * zdm 조회 옵션 추출
   */
  private extractFilterOptions({ query }: { query: ZdmQueryFilterDTO }): ZdmFilterOptions {
    const filterOptions: ZdmFilterOptions = {
      connection: query.connection || "",
      activation: query.activation || "",
      network: query.network ?? false,
      disk: query.disk ?? false,
      partition: query.partition ?? false,
      repository: query.repository ?? false,
      zosRepository: query.zosRepository ?? false,
      detail: query.detail ?? false,
    }
    return filterOptions
  }

  /**
   * zdm 전체 정보 조회
   */
  getZdms = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `ZDM 목록 조회 시작` })

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
    } catch (error) {
      return handleControllerError({
        next,
        error,
        logErrorMessage: "ZDM 목록 조회 중 ZDMController.getZDMs() 오류 발생",
        apiErrorMessage: "ZDM 목록 조회 중 오류가 발생했습니다",
        operation: "ZDM 조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }

  /**
   * zdm 이름으로 정보 조회
   */
  getZdmByName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
    } catch (error) {
      return handleControllerError({
        next,
        error,
        logErrorMessage: "ZDM 정보 중 ZDMController.getZDMs() 오류 발생",
        apiErrorMessage: "ZDM 정보 중 오류가 발생했습니다",
        operation: "단일 ZDM 조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }

  /**
   * zdm ID로 정보 조회
   */
  getZdmById = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
    } catch (error) {
      return handleControllerError({
        next,
        error,
        logErrorMessage: "ZDM 정보 중 ZDMController.getZDMs() 오류 발생",
        apiErrorMessage: "ZDM 정보 중 오류가 발생했습니다",
        operation: "단일 ZDM 조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }
}
