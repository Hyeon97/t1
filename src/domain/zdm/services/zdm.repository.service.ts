import { ServiceError } from "../../../errors/service/service-error"
import { BaseService } from "../../../utils/base/base-service"
import { ZdmRepository } from "../repositories/center-info.repository"
import { ZdmRepositoryRepository } from "../repositories/center-repository.repository"
import { ZdmRepositoryFilterOptions } from "../types/zdm-repository/zdm-repository-filter.type"
import { ZdmRepositoryDataResponse } from "../types/zdm-repository/zdm-repository-response.type"

export class ZdmRepositoryService extends BaseService {
  private readonly zdmRepository: ZdmRepository
  private readonly zdmRepositoryRepository: ZdmRepositoryRepository
  constructor({ zdmRepository, zdmRepositoryRepository }: { zdmRepository: ZdmRepository; zdmRepositoryRepository: ZdmRepositoryRepository }) {
    super({
      serviceName: "ZdmRepositoryService",
    })
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
      return this.handleServiceError({
        error,
        functionName: "getRepositoryList",
        message: "ZDM Repository 정보 목록 조회 중 오류가 발생했습니다",
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
        throw ServiceError.resourceNotFoundError(ServiceError, {
          functionName: "getRepositoryById",
          message: `ID가 '${id}'인 ZDM Repository를 찾을 수 없습니다`,
          metadata: { id },
        })
      }
      return { items: [repos] }
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getRepositoryById",
        message: `ZDM Repository 정보 조회 중 오류가 발생했습니다`,
      })
    }
  }
}
