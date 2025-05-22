import { NextFunction, Response } from "express"
import { AuthenticatedUser, ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { LicenseAssignService } from "../services/license-assign.service"
import { LicenseAssignRequestBody } from "../types/license-assign.type"

export class LicenseAssignController extends BaseController {
  private readonly licenseAssignService: LicenseAssignService

  constructor({ licenseAssignService }: { licenseAssignService: LicenseAssignService }) {
    super({
      controllerName: "LicenseAssignController",
    })
    this.licenseAssignService = licenseAssignService
  }


  /**
   * License 할당 main
   */

  assign = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `License 할당 시작` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "assign", state: "start" })

      //  user data 추출
      const userData = req.user as AuthenticatedUser
      ContextLogger.debug({ message: `요청 사용자 정보`, meta: userData })

      //  body data 추출
      const data = req.body as LicenseAssignRequestBody

      //  서비스 호출
      const resultData = await this.licenseAssignService.main({ data, user: userData })

      //  출력 가공
      ApiUtils.success({ res, data: resultData, message: "License assign result" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "assign", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "assign",
        message: "[License 할당] - 오류가 발생했습니다",
      })
    }
  }
}