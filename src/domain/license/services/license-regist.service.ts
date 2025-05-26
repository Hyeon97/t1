import { AuthenticatedUser } from "../../../types/common/req.types"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { DateTimeUtils } from "../../../utils/Dayjs.utils"
import { jobUtils } from "../../../utils/job/job.utils"
import { regNumberOnly } from "../../../utils/regex.utils"
import { JobInteractiveRepository } from "../../interactive/repositories/job-interactive.repository"
import { JobInteractiveService } from "../../interactive/services/interactive.service"
import { JobInteractiveLicenseRegistInput, JobInteractiveStatusEnum, JobInteractiveTypeEnum } from "../../interactive/types/interactive"
import { ZdmGetService } from "../../zdm/services/common/zdm-get.service"
import { ZdmInfoTable } from "../../zdm/types/db/center-info"
import { LicenseRegistRequestBody } from "../types/license-regist.type"
import { LicenseDataResponse } from "../types/license-response.type"
import { LicenseGetService } from "./license-get.service"

export class LicenseRegistService extends BaseService {
  private readonly jobInteractiveRepository: JobInteractiveRepository
  private readonly jobInteractiveService: JobInteractiveService
  private readonly zdmGetService: ZdmGetService
  private readonly licenseGetService: LicenseGetService
  constructor({
    jobInteractiveRepository,
    jobInteractiveService,
    zdmGetService,
    licenseGetService
  }: {
    jobInteractiveRepository: JobInteractiveRepository
    jobInteractiveService: JobInteractiveService
    zdmGetService: ZdmGetService
    licenseGetService: LicenseGetService
  }) {
    super({
      serviceName: "LicenseAssignService",
    })
    this.jobInteractiveRepository = jobInteractiveRepository
    this.jobInteractiveService = jobInteractiveService
    this.zdmGetService = zdmGetService
    this.licenseGetService = licenseGetService
  }

  /**
   * zdm 정보  가져오기
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
        message: "[License 등록] - Zdm 정보 조회 오류 발생",
      })
    }
  }

  /**
   * job_interactive table에 License 등록을 위한 form 생성
   */
  private async createLicenseRegistForm({ data, user, center }: { data: LicenseRegistRequestBody, user: AuthenticatedUser, center: ZdmInfoTable }): Promise<JobInteractiveLicenseRegistInput> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createLicenseRegistForm", state: "start" })
      //  desc 없는 경우 default 값 추가
      if (!data.desc) { data.desc = '-' }
      //  name 없는 경우 default 값 자동 생성
      if (!data.name) { data.name = `zcon-license-${DateTimeUtils.getCurrentTimestamp()}` }
      //  UUID 양식 불일치인 경우 자동으로 괄호
      if (!data.centerUUID.startsWith('{') || !data.centerUUID.endsWith('}')) {
        // Wrap the value with '{' and '}'
        data.centerUUID = `{${data.centerUUID.replace(/^\{|\}$/g, '')}}`
      }
      const nRequestID = await jobUtils.getRandomNumber({
        checkExists: async (requestID) => (await this.jobInteractiveRepository.findByRequestID({ requestID })) !== null,
      })
      const form: JobInteractiveLicenseRegistInput = {
        nUserID: user.id,
        nGroupID: 0,
        nCenterID: center.nID,
        nRequestID,
        sSystemName: center.sCenterName,
        nJobStatus: JobInteractiveStatusEnum.WAITING,
        nJobType: JobInteractiveTypeEnum.JOBTYPE_LICENSE_ADD,
        sJobData: `${user.email}|${data.centerUUID}|${data.key}|${data.name}|${data.desc}`,
        nJobID: 0,
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createLicenseRegistForm", state: "end" })
      return form
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "createLicenseRegistForm",
        message: "[License 등록] - License 등록을 위한 form 생성 중 오류 발생",
      })
    }
  }

  /**
   * License 등록 main 함수
   */
  async main({ data, user }: { data: LicenseRegistRequestBody, user: AuthenticatedUser }): Promise<LicenseDataResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "main", state: "start" })
      //  라이센스 등록 시작
      //  center 정보 가져오기
      const center = await this.getZdmInfo({ zdm: data.center })
      //  job_interactive table 등록용 객체 생성
      const registForm = await this.createLicenseRegistForm({ data, user, center })
      //  등록 및 검증 ( 검증 성공시 zcon_license table에는 center agent가 자동으로 등록 함 )
      await this.jobInteractiveService.licenseVerification({ data: registForm })
      //  등록 성공 여부 확인
      const license = await this.licenseGetService.getLicenseByName({ name: data.name! })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "main", state: "end" })
      return license
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "main",
        message: "[License 등록] - License 등록 중 에러 발생",
      })
    }
  }
}