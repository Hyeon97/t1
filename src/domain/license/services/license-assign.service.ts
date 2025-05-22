import { AuthenticatedUser } from "../../../types/common/req.types"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { ServerGetService } from "../../server/services/server-get.service"
import { ServerBasicTable } from "../../server/types/db/server-basic"
import { ZconLicenseRepository } from "../repositories/zcon-license.repository"
import { LicenseAssignRequestBody } from "../types/license-assign.type"

export class LicenseAssignService extends BaseService {
  private readonly licenseRepository: ZconLicenseRepository
  private readonly serverGetService: ServerGetService

  constructor({ licenseRepository, serverGetService, }: {
    licenseRepository: ZconLicenseRepository, serverGetService: ServerGetService
  }) {
    super({
      serviceName: "LicenseAssignService",
    })
    this.licenseRepository = licenseRepository
    this.serverGetService = serverGetService
  }

  /**
   * server 정보 검증 및 가져오기
   */
  private async getServerInfo({ server }: { server: number | string }): Promise<ServerBasicTable> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerInfo", state: "start" })
      let serverInfo = null
      if (typeof server === "number") {
        serverInfo = await this.serverGetService.getServerById({ id: String(server) })
      } else if (typeof server === "string") {
        serverInfo = await this.serverGetService.getServerByName({ name: server, })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerInfo", state: "end" })
      return serverInfo?.server!
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getServerInfo",
        message: "[License 할당] - Server 정보 조회 오류 발생",
      })
    }
  }

  /**
   * license 정보 검증 및 가져오기
   */
  private async getLicenseInfo({ license }: { license: string }): Promise<any> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerInfo", state: "start" })
      let licenseInfo = null
      if (typeof license === "number") {
        licenseInfo = await this.licenseRepository.getServerById({ id: String(license) })
      } else if (typeof license === "string") {
        licenseInfo = await this.licenseRepository.getServerByName({ name: license, })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerInfo", state: "end" })
      return licenseInfo?.license!
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getLicenseInfo",
        message: "[License 할당] - License 정보 조회 오류 발생",
      })
    }
  }

  /**
   * License 할당 main 함수
   */
  async main({ data, user }: { data: LicenseAssignRequestBody, user: AuthenticatedUser }): Promise<any> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "main", state: "start" })
      //  라이센스 할당 시작
      console.dir(data, { depth: null })
      //  server 정보 검증 및 가져오기
      const server = - await this.getServerInfo({ server: data.server })
      //  license 정보 검증
      const license = await this.licenseRepository.getLicenseById({ id: data.license })
      //  license 할당

      asyncContextStorage.addOrder({ component: this.serviceName, method: "main", state: "end" })
      return data
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "main",
        message: "[License 할당] - License 할당 중 에러 발생",
      })
    }
  }
}