import { AuthenticatedUser } from "../../../types/common/req.types"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { jobUtils } from "../../../utils/job/job.utils"
import { regNumberOnly } from "../../../utils/regex.utils"
import { JobInteractiveRepository } from "../../interactive/repositories/job-interactive.repository"
import { JobInteractiveService } from "../../interactive/services/interactive.service"
import {
  JobInteractiveLicenseVerificationInput,
  JobInteractiveLicenseVerificationMap,
  JobInteractiveLicenseVerificationMode,
  JobInteractiveStatusEnum,
  JobInteractiveTypeEnum,
} from "../../interactive/types/interactive"
import { ServerBasicRepository } from "../../server/repositories/server-basic.repository"
import { ServerGetService } from "../../server/services/server-get.service"
import { ServerBasicTable } from "../../server/types/db/server-basic"
import { ZdmGetService } from "../../zdm/services/common/zdm-get.service"
import { ZdmInfoTable } from "../../zdm/types/db/center-info"
import { LicenseHistoryRepository } from "../repositories/zcon-license-history.repository"
import { LicenseRepository } from "../repositories/zcon-license.repository"
import { ZconLicenseTable } from "../types/db/zcon_license"
import { LicenseAssignRequestBody } from "../types/license-assign.type"
import { LicenseTypeMap } from "../types/license-common.type"
import { LicenseHistoryTableInput } from "../types/license-history.type"
import { LicenseAssignResponse } from "../types/license-response.type"
import { LicenseGetService } from "./license-get.service"

export class LicenseAssignService extends BaseService {
  private readonly licenseRepository: LicenseRepository
  private readonly licenseHistoryRepository: LicenseHistoryRepository
  private readonly jobInteractiveRepository: JobInteractiveRepository
  private readonly serverBasicRepository: ServerBasicRepository
  private readonly licenseGetService: LicenseGetService
  private readonly serverGetService: ServerGetService
  private readonly zdmGetService: ZdmGetService
  private readonly jobInteractiveService: JobInteractiveService
  constructor({
    licenseRepository,
    licenseHistoryRepository,
    jobInteractiveRepository,
    serverBasicRepository,
    licenseGetService,
    serverGetService,
    zdmGetService,
    jobInteractiveService,
  }: {
    licenseRepository: LicenseRepository
    licenseHistoryRepository: LicenseHistoryRepository
    jobInteractiveRepository: JobInteractiveRepository
    serverBasicRepository: ServerBasicRepository
    licenseGetService: LicenseGetService
    serverGetService: ServerGetService
    zdmGetService: ZdmGetService
    jobInteractiveService: JobInteractiveService
  }) {
    super({
      serviceName: "LicenseAssignService",
    })
    this.licenseRepository = licenseRepository
    this.licenseHistoryRepository = licenseHistoryRepository
    this.jobInteractiveRepository = jobInteractiveRepository
    this.serverBasicRepository = serverBasicRepository
    this.licenseGetService = licenseGetService
    this.serverGetService = serverGetService
    this.zdmGetService = zdmGetService
    this.jobInteractiveService = jobInteractiveService
  }

  /**
   * server 정보 검증 및 가져오기
   */
  private async getServerInfo({ server }: { server: string }): Promise<ServerBasicTable> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerInfo", state: "start" })
      let serverInfo = null
      if (regNumberOnly.test(server)) {
        serverInfo = await this.serverGetService.getServerById({ id: String(server) })
      } else {
        serverInfo = await this.serverGetService.getServerByName({ name: server })
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
   * zdm 정보 검증 및 가져오기
   */
  private async getZdmInfo({ zdm }: { zdm: string }): Promise<ZdmInfoTable> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmInfo", state: "start" })
      let zdmInfo = null
      if (regNumberOnly.test(zdm)) {
        zdmInfo = await this.zdmGetService.getZdmInfoOnlyById({ id: zdm })
      } else {
        zdmInfo = await this.zdmGetService.getZdmInfoOnlyByName({ name: zdm })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmInfo", state: "end" })
      return zdmInfo
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getZdmInfo",
        message: "[License 할당] - Zdm 정보 조회 오류 발생",
      })
    }
  }

  /**
   * license 정보 검증 및 가져오기
   */
  private async getLicenseInfo({ license }: { license: string }): Promise<ZconLicenseTable> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getLicenseInfo", state: "start" })
      let licenseInfo = null
      if (regNumberOnly.test(license)) {
        licenseInfo = await this.licenseGetService.getLicenseById({ id: String(license) })
      } else {
        licenseInfo = await this.licenseGetService.getLicenseByName({ name: license })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getLicenseInfo", state: "end" })
      return licenseInfo?.items[0]!
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getLicenseInfo",
        message: "[License 할당] - License 정보 조회 오류 발생",
      })
    }
  }

  /**
   * job_interactive table에 License 검증 disable/enable을 위한 form 생성
   */
  private async createLicenseVerificationForm({
    type,
    license,
    center,
    user,
  }: {
    type: JobInteractiveLicenseVerificationMode
    license: ZconLicenseTable
    center: ZdmInfoTable
    user: AuthenticatedUser
  }): Promise<JobInteractiveLicenseVerificationInput> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createLicenseVerificationForm", state: "start" })
      const nRequestID = await jobUtils.getRandomNumber({
        checkExists: async (requestID) => (await this.jobInteractiveRepository.findByRequestID({ requestID })) !== null,
      })
      const form: JobInteractiveLicenseVerificationInput = {
        nUserID: user.id,
        nGroupID: 0,
        nRequestID,
        nCenterID: license.nCenterID!, // license가 등록되어 있는 Center ID 가져감
        sSystemName: center.sCenterName,
        nJobStatus: JobInteractiveStatusEnum.WAITING,
        nJobType: JobInteractiveTypeEnum.JOBTYPE_LICENSE_VALIDATION_CHECK,
        sJobData: String(JobInteractiveLicenseVerificationMap.fromString({ str: type })),
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createLicenseVerificationForm", state: "end" })
      return form
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "assignLicense",
        message: "[License 할당] - License 검증 disable/enable을 위한 form 생성 중 오류 발생",
      })
    }
  }

  /**
   * zcon_license_history table에 등록할 form 생성
   */
  private createLicenseHistoryForm({
    user, license, server
  }: {
    user: AuthenticatedUser
    license: ZconLicenseTable
    server: ServerBasicTable
  }): LicenseHistoryTableInput {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createLicenseHistoryForm", state: "start" })
      const form: LicenseHistoryTableInput = {
        nUserID: user.id,
        nLicenseID: license.nID,
        nCenterID: license.nCenterID,
        nLicenseType: license.nLicenseCategory,
        sSystemName: server.sSystemName,
        sUpdateTime: "now()"
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createLicenseHistoryForm", state: "end" })
      return form
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "createLicenseHistoryForm",
        message: "[License 할당] - License 할당 history data form 생성 중 오류 발생",
      })
    }
  }

  /**
   * License 할당
   */
  async assignLicense({
    server,
    license,
    center,
    user,
  }: {
    server: ServerBasicTable
    license: ZconLicenseTable
    center: ZdmInfoTable
    user: AuthenticatedUser
  }): Promise<any> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "assignLicense", state: "start" })
      //  [License 검증 disable]
      //  License 검증 disable form 생성
      const disableForm = await this.createLicenseVerificationForm({ type: "disable", license, center, user })
      //  License 검증 disable
      const disableResult = await this.jobInteractiveService.toggleLicenseVerification({ data: disableForm })
      await this.executeTransaction({
        callback: async (transaction) => {
          //  server에 license 할당
          //  server data의 license id 업데이트
          const licensedServerData = structuredClone(server)
          licensedServerData.nLicenseID = license.nID
          await this.serverBasicRepository.updateServerById({
            id: server.nID,
            data: licensedServerData,
            transaction,
          })
          //  license history에 기록 추가
          const historyForm = this.createLicenseHistoryForm({ user, license, server })
          await this.licenseHistoryRepository.insertHistory({ data: historyForm, transaction })
        },
      })
      //  [license 검증 enable]
      //  license 검증 enable form 생성
      const enableForm = await this.createLicenseVerificationForm({ type: "enable", license, center, user })
      //  license 검증 enable
      const enableResult = await this.jobInteractiveService.toggleLicenseVerification({ data: enableForm })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "assignLicense", state: "end" })
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "assignLicense",
        message: "[License 할당] - License 할당 중 오류 발생",
      })
    }
  }

  /**
   * License 할당 main 함수
   */
  async main({ data, user }: { data: LicenseAssignRequestBody; user: AuthenticatedUser }): Promise<LicenseAssignResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "main", state: "start" })
      //  라이센스 할당 시작
      //  server 정보 검증 및 가져오기
      const server = await this.getServerInfo({ server: data.server })
      //  license 정보 검증
      const license = await this.getLicenseInfo({ license: data.license })
      //  center 정보 가져오기
      const center = await this.getZdmInfo({ zdm: String(license.nCenterID) })
      //  license 할당
      await this.assignLicense({ server, license, center, user })

      const returnData: LicenseAssignResponse = {
        server: {
          id: String(server.nID),
          name: server.sSystemName
        },
        license: {
          id: String(license.nID),
          name: license.sLicenseName,
          category: LicenseTypeMap.toString({ value: license.nLicenseCategory }),
          created: license.sLicenseCreateDate,
          expiration: license.sLicenseExpirationDate
        }
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "main", state: "end" })
      return returnData
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "main",
        message: "[License 할당] - License 할당 중 에러 발생",
      })
    }
  }
}
