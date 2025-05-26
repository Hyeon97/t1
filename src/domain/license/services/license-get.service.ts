import { ServiceError } from "../../../errors/service/service-error"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { regNumberOnly } from "../../../utils/regex.utils"
import { LicenseRepository } from "../repositories/zcon-license.repository"
import { LicenseFilterOptions } from "../types/license-get.type"
import { LicenseDataResponse } from "../types/license-response.type"

export class LicenseGetService extends BaseService {
  private readonly licenseRepository: LicenseRepository

  constructor({ licenseRepository }: { licenseRepository: LicenseRepository }) {
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
      asyncContextStorage.addService({ name: this.serviceName })
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

  /**
   * License ID로 조회
   */
  async getLicenseById({ id, filterOptions }: { id: string; filterOptions?: LicenseFilterOptions }): Promise<LicenseDataResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getLicenseById", state: "start" })

      // ID 형식 검증
      if (!regNumberOnly.test(id)) {
        throw ServiceError.validationError(ServiceError, {
          method: "getLicenseById",
          message: `License ID는 숫자만 가능 합니다. 입력값: '${id}'`,
          metadata: { id },
        })
      }

      const license = await this.licenseRepository.findById({ id, filterOptions })

      // license가 존재하는지 확인
      if (!license) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "getLicenseById",
          message: `ID가 '${id}'인 License를 찾을 수 없습니다`,
        })
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "getLicenseById", state: "end" })
      return { items: [license] }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getLicenseById",
        message: "[License ID로 정보 조회] - License 정보 조회 중 에러 발생",
      })
    }
  }

  /**
   * License Name으로 조회
   */
  async getLicenseByName({ name, filterOptions }: { name: string; filterOptions?: LicenseFilterOptions }): Promise<LicenseDataResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getLicenseByName", state: "start" })

      // Name 형식 검증 (빈 문자열 체크)
      if (!name || name.trim().length === 0) {
        throw ServiceError.validationError(ServiceError, {
          method: "getLicenseByName",
          message: `License Name은 필수 입력 항목입니다. 입력값: '${name}'`,
          metadata: { name },
        })
      }

      const license = await this.licenseRepository.findByName({ name, filterOptions })

      // license가 존재하는지 확인
      if (!license) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "getLicenseByName",
          message: `Name이 '${name}'인 License를 찾을 수 없습니다`,
        })
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "getLicenseByName", state: "end" })
      return { items: [license] }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getLicenseByName",
        message: "[License 이름으로 정보 조회] - License 정보 조회 중 에러 발생",
      })
    }
  }
}
