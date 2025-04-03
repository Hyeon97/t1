import { NextFunction, Response } from "express"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { logger } from "../../../utils/logger/logger.util"
import { ZdmRepositoryFilterDTO } from "../dto/query/zdm-repository/zdm-repository-query-filter.dto"
import { ZdmRepositoryInfoDTO } from "../dto/repository/zdm.repository.dto"
import { ZdmRepositoryFilterOptions } from "../types/zdm-repository/zdm-repository-filter.type"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ZdmError } from "../../../errors/domain-errors/ZdmError"
import { handleControllerError } from "../../../errors/handler/integration-error-handler"
import { ZdmRepositoryService } from "../services/zdm.repository.service"

export class ZdmRepositoryController {
  private readonly zdmRepositoryService: ZdmRepositoryService
  constructor({ zdmRepositoryService }: { zdmRepositoryService: ZdmRepositoryService }) {
    this.zdmRepositoryService = zdmRepositoryService
  }
  /**
   * ZDM Repository 조회 옵션 추출
   */
  private extractFilterOptions({ query }: { query: ZdmRepositoryFilterDTO }): ZdmRepositoryFilterOptions {
    const filterOptions: ZdmRepositoryFilterOptions = {
      type: query.type || "",
      os: query.os || "",
      path: query.path || "",
      // identifierType: query.identifierType || "",
      center: query.center || "",
    }
    return filterOptions
  }

  /**
   * ZDM 전체 repository 정보 조회
   */
  getRepositories = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `ZDM Repository 목록 조회 시작` })

      // 필터 옵션 추출
      const query = req.query as unknown as ZdmRepositoryFilterDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      //  서비스 호출
      const repositories = await this.zdmRepositoryService.getRepositoryList({ filterOptions })

      //  출력 가공
      const repositoriesDTO = ZdmRepositoryInfoDTO.fromEntities({ repositories })
      logger.info(`총 ${repositoriesDTO.length}개의 ZDM Repository 정보를 조회했습니다.`)

      ApiUtils.success({ res, data: repositoriesDTO, message: "ZDM Repository infomation list" })
    } catch (error) {
      return handleControllerError({
        next,
        error,
        logErrorMessage: "ZDM Repository 목록 조회 중 ZdmRepositoryController.getRepositories() 오류 발생",
        apiErrorMessage: "ZDM Repository 목록 조회 중 오류가 발생했습니다",
        operation: "ZDM Repository 조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }
}
