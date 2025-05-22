import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { ZconLicenseRepository } from "../repositories/zcon-license.repository"
import { LicenseFilterOptions } from "../types/license-get.type"
import { LicenseDataResponse } from "../types/license-response.type"

export class LicenseGetService extends BaseService {
  private readonly licenseRepository: ZconLicenseRepository

  constructor({ licenseRepository }: { licenseRepository: ZconLicenseRepository }) {
    super({
      serviceName: "LicenseGetService",
    })
    this.licenseRepository = licenseRepository
  }

  /**
   * 모든 License 정보 조회
   */
  async getLicenses({ filterOptions }: { filterOptions: LicenseFilterOptions }): Promise<LicenseDataResponse> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getLicenses", state: "start" })
      const licenses = await this.licenseRepository.findAll({ filterOptions })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getLicenses", state: "end" })
      return { items: licenses }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getLicenses",
        message: "[License 정보 조회] - License 정보 조회 중 에러 발생",
      })
    }
  }
}