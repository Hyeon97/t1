import { NextFunction, Response } from "express"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { LicenseDeleteByLicenseIdParamDTO } from "../dto/param/license-delete-param.dto"
import { LicenseDeleteService } from "../services/license-delete.service"

export class LicenseDeleteController extends BaseController {
  private readonly licenseDeleteService: LicenseDeleteService

  constructor({ licenseDeleteService }: { licenseDeleteService: LicenseDeleteService }) {
    super({
      controllerName: "LicenseDeleteController"
    })
    this.licenseDeleteService = licenseDeleteService
  }

  /**
   * 공통 License 삭제 핸들러 
   */
  private async handleLicenseDelete<T>({
    req,
    res,
    next,
    methodName,
    paramExtractor,
    errorMessage,
    serviceMethod,
  }: {
    req: ExtendedRequest
    res: Response
    next: NextFunction
    methodName: string
    errorMessage: string
    paramExtractor: (params: any) => { licenseId?: number; licenseKey?: string }
    serviceMethod: (params: any) => Promise<any>
  }): Promise<void> {
    try {
      ContextLogger.debug({ message: `License 삭제 시작 - ${methodName}` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: methodName, state: "start" })

      // 파라미터 추출 ( licenseId || licenseKey )
      const params = req.params as unknown as T
      const identifier = paramExtractor(params)
      ContextLogger.debug({ message: `[식별자]`, meta: identifier! })

      // 서비스 메서드 호출 - 수정된 부분
      const resultData = await serviceMethod(identifier)

      ContextLogger.info({ message: `License 삭제 완료` })
      ApiUtils.success({ res, data: resultData, message: "License data delete result" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: methodName, state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: methodName,
        message: errorMessage,
      })
    }
  }

  /**
   * License ID로 삭제 
   */
  deleteById = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleLicenseDelete<LicenseDeleteByLicenseIdParamDTO>({
      req,
      res,
      next,
      methodName: "deleteById",
      errorMessage: "[License ID로 삭제] - 예기치 못한 오류 발생",
      paramExtractor: (params) => ({ licenseId: params.licenseId }),
      serviceMethod: ({ licenseId }) => this.licenseDeleteService.deleteByLicenseId({ licenseId }),
    })
  }

  // /**
  //  *  License Key로 삭제
  //  */
  // deleteByKey = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
  //   await this.handleLicenseDelete<LicenseDeleteByLicenseKeyParamDTO>({
  //     req,
  //     res,
  //     next,
  //     methodName: "deleteByKey",
  //     errorMessage: "[License Key로 삭제] - 예기치 못한 오류 발생",
  //     paramExtractor: (params) => ({ licenseKey: params.licenseKey }),
  //     serviceMethod: ({ licenseKey }) => this.licenseDeleteService.deleteByKey({ licenseKey }),
  //   })
  // }

  // /**
  //  * license 삭제 main
  //  */
  // delete = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     ContextLogger.debug({ message: `License 삭제 시작` })
  //     asyncContextStorage.setController({ name: this.controllerName })
  //     asyncContextStorage.addOrder({ component: this.controllerName, method: "delete", state: "start" })

  //     //  user data 추출
  //     const userData = req.user as AuthenticatedUser
  //     ContextLogger.debug({ message: `요청 사용자 정보`, meta: userData })

  //     //  body data 추출
  //     const data = req.body as LicenseRegistRequestBody

  //     //  서비스 호출
  //     const licenseData = await this.licenseDeleteService.main({ data, user: userData })
  //     const licensesDTO = LicenseResponseFactory.createFromEntities({ licenseData: licenseData.items })

  //     //  출력 가공
  //     ApiUtils.success({ res, data: licensesDTO[0], message: "License delete result" })
  //     asyncContextStorage.addOrder({ component: this.controllerName, method: "delete", state: "end" })
  //   } catch (error) {
  //     this.handleControllerError({
  //       next,
  //       error,
  //       method: "delete",
  //       message: "[License 삭제] - 오류가 발생했습니다",
  //     })
  //   }
  // }
}