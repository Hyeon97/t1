import { NextFunction, Response } from "express"
import { AuthenticatedUser, ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { LicenseResponseFactory } from "../dto/response/license-response-factory"
import { LicenseRegistService } from "../services/license-regist.service"
import { LicenseRegistRequestBody } from "../types/license-regist.type"

export class LicenseRegistController extends BaseController {
  private readonly licenseRegistService: LicenseRegistService

  constructor({ licenseRegistService }: { licenseRegistService: LicenseRegistService }) {
    super({
      controllerName: "LicenseRegistController",
    })
    this.licenseRegistService = licenseRegistService
  }

  /**
   * License 등록 main
   */
  regist = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `License 등록 시작` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "regist", state: "start" })

      //  user data 추출
      const userData = req.user as AuthenticatedUser
      ContextLogger.debug({ message: `요청 사용자 정보`, meta: userData })

      //  body data 추출
      const data = req.body as LicenseRegistRequestBody

      //  서비스 호출
      const licenseData = await this.licenseRegistService.main({ data, user: userData })
      const licensesDTO = LicenseResponseFactory.createFromEntities({ licenseData: licenseData.items })
      //  출력 가공
      ApiUtils.success({ res, data: licensesDTO[0], message: "License regist result" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "regist", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "regist",
        message: "[License 등록] - 오류가 발생했습니다",
      })
    }
  }
}
