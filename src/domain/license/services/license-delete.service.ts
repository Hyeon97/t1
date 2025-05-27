import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { LicenseRepository } from "../repositories/zcon-license.repository"
import { LicenseDeleteResponse } from "../types/license-response.type"

export class LicenseDeleteService extends BaseService {
  private readonly licenseRepository: LicenseRepository
  constructor({ licenseRepository }: { licenseRepository: LicenseRepository }) {
    super({
      serviceName: "LicenseDeleteService",
    })
    this.licenseRepository = licenseRepository
  }

  /**
   * License ID로 삭제
   */
  async deleteByLicenseId({ licenseId }: { licenseId: number }): Promise<LicenseDeleteResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "deleteByLicenseId", state: "start" })
      //  라이센스 삭제
      const result = await this.executeTransaction({
        callback: async (transaction) => {
          //  삭제할 license 정보 조회
          const license = await this.licenseRepository.findById({ id: String(licenseId) })
          if (!license) {
            const returnObject: LicenseDeleteResponse = {
              license_Id: licenseId,
              message: "License was already deleted or does not exist",
              delete_state: {
                data: "fail"
              },
            }

            return returnObject
          }
          //  license 존재하는 경우 삭제 진행
          await this.licenseRepository.deleteLicenseById({ licenseId, transaction })
          const returnObject: LicenseDeleteResponse = {
            license_Id: licenseId,
            message: "License deleted successfully",
            delete_state: {
              data: "success"
            },
          }
          return returnObject
        }
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "deleteByLicenseId", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "deleteByLicenseId",
        message: "[License 삭제] - License ID로 삭제 중 에러 발생",
      })
    }
  }
}