import { NextFunction, Response } from "express"
import { ControllerError } from "../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ZdmRepositoryFilterDTO } from "../dto/query/zdm-repository/zdm-repository-query-filter.dto"
import { ZdmRepositoryInfoDTO } from "../dto/repository/zdm.repository.dto"
import { ZdmRepositoryService } from "../services/zdm.repository.service"
import { ZdmRepositoryFilterOptions } from "../types/zdm-repository/zdm-repository-filter.type"
import { asyncContextStorage } from "../../../utils/AsyncContext"

export class ZdmRepositoryController extends BaseController {
  private readonly zdmRepositoryService: ZdmRepositoryService
  constructor({ zdmRepositoryService }: { zdmRepositoryService: ZdmRepositoryService }) {
    super({
      controllerName: "ZdmRepositoryController",
    })
    this.zdmRepositoryService = zdmRepositoryService
  }
  /**
   * ZDM Repository 조회 옵션 추출
   */
  private extractFilterOptions({ query }: { query: ZdmRepositoryFilterDTO }): ZdmRepositoryFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: ZdmRepositoryFilterOptions = {
        //  필터
        type: query.type || "",
        os: query.os || "",
        path: query.path || "",
        // identifierType: query.identifierType || "",
        center: query.center || "",
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[ZDM 필터 옵션 추출] - 오류가 발생했습니다",
        cause: error,
      })
    }
  }

  /**
   * ZDM 전체 repository 정보 조회
   */
  getRepositories = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getRepositories", state: "start" })
      ContextLogger.debug({ message: `ZDM Repository 목록 조회 시작` })

      // 필터 옵션 추출
      const query = req.query as unknown as ZdmRepositoryFilterDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      //  서비스 호출
      const repositories = await this.zdmRepositoryService.getRepositoryList({ filterOptions })

      //  출력 가공
      const repositoriesDTO = ZdmRepositoryInfoDTO.fromEntities({ repositories })
      ContextLogger.info({ message: `총 ${repositoriesDTO.length}개의 ZDM Repository 정보를 조회했습니다` })
      ApiUtils.success({ res, data: repositoriesDTO, message: "ZDM Repository infomation list" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getRepositories", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "getRepositories",
        message: "[ZDM Repository 목록 조회] - 오류가 발생했습니다",
      })
    }
  }
}
