import { ZdmError } from "../../../errors/domain-errors/ZdmError"
import { handleServiceError } from "../../../errors/handler/integration-error-handler"
import { ZdmRepository } from "../repositories/center-info.repository"
import { ZdmRepositoryRepository } from "../repositories/center-repository.repository"
import { ZdmRepositoryFilterOptions } from "../types/zdm-repository/zdm-repository-filter.type"
import { ZdmRepositoryDataResponse } from "../types/zdm-repository/zdm-repository-response.type"

export class ZdmRepositoryService {
  private readonly zdmRepository: ZdmRepository
  private readonly zdmRepositoryRepository: ZdmRepositoryRepository
  constructor({ zdmRepository, zdmRepositoryRepository }: { zdmRepository: ZdmRepository; zdmRepositoryRepository: ZdmRepositoryRepository }) {
    this.zdmRepository = zdmRepository
    this.zdmRepositoryRepository = zdmRepositoryRepository
  }

  /**
   * 모든 Repository 정보 조회
   */
  async getRepositoryList({ filterOptions }: { filterOptions: ZdmRepositoryFilterOptions }): Promise<ZdmRepositoryDataResponse> {
    try {
      const repos = await this.zdmRepositoryRepository.findAll({ filterOptions })
      return { items: repos }
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "ZDM Repository 정보 조회 중 ZdmService.getZdms() 오류 발생",
        apiErrorMessage: "ZDM Repository 정보 조회 중 오류가 발생했습니다",
        operation: "ZDM Repository 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }

  /**
   * Repository ID로 정보 조회
   */
  async getRepositoryById({ id, filterOptions }: { id: number; filterOptions: ZdmRepositoryFilterOptions }): Promise<ZdmRepositoryDataResponse> {
    try {
      const repos = await this.zdmRepositoryRepository.findById({ id, filterOptions })
      if (!repos) {
        throw new ZdmError.ZdmRepositoryNotFound({ repo: id, type: "id" })
      }
      return { items: [repos] }
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "ZDM Repository 정보 조회 중 ZdmRepositoryService.getRepositoryById() 오류 발생",
        apiErrorMessage: "ZDM Repository 정보 조회 중 오류가 발생했습니다",
        operation: "단일 ZDM Repository 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }
}
