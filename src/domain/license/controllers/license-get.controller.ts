import { NextFunction, Response } from "express"
import { ControllerError } from "../../../errors"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { LicenseGetQueryDTO } from "../dto/query/license-get-query"
import { LicenseResponseFactory } from "../dto/response/license-response-factory"
import { LicenseGetService } from "../services/license-get.service"
import { LicenseFilterOptions } from "../types/license-get.type"

export class LicenseGetController extends BaseController {
  private readonly licenseGetService: LicenseGetService

  constructor({ licenseGetService }: { licenseGetService: LicenseGetService }) {
    super({
      controllerName: "LicenseGetController",
    })
    this.licenseGetService = licenseGetService
  }

  //  License 조회 옵션 추출
  private extractFilterOptions({ query }: { query: LicenseGetQueryDTO }): LicenseFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: LicenseFilterOptions = {
        //  필터
        category: query.category,
        exp: query.exp || "",
        created: query.created || "",
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[License 정보 조회 필터 옵션 추출] - 필터 옵션 확인필요",
        error,
      })
    }
  }

  /**
   * 공통 License 정보 조회 핸들러
   */
  private async handleLicenseGet<T>({
    req,
    res,
    next,
    methodName,
    paramExtractor,
    errorMessage,
    serviceMethod
  }: {
    req: ExtendedRequest
    res: Response
    next: NextFunction
    methodName: string
    errorMessage: string
    paramExtractor?: (params: any) => {}
    serviceMethod: (params: any) => Promise<any>
  }): Promise<void> {
    try {
      ContextLogger.debug({ message: `License 정보 조회 시작 - ${methodName}` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: methodName, state: "start" })

      //  필터 옵션 추출
      const query = req.query as unknown as LicenseGetQueryDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      //  파라미터 추출 (필요한 경우)
      let identifier = {}
      if (paramExtractor) {
        const params = req.params as unknown as T
        identifier = paramExtractor(params)
        ContextLogger.debug({ message: `[식별자]`, meta: identifier })
      }

      //  서비스 호출
      const licenseData = await serviceMethod({ ...identifier, filterOptions })
      //  출력 가공
      const licensesDTO = LicenseResponseFactory.createFromEntities({ licenseData: licenseData.items })

      const resultMessage = `총 ${Array.isArray(licenseData) ? licenseData.length : 1}개의 License 정보를 조회했습니다.`
      ContextLogger.info({ message: resultMessage })

      ApiUtils.success({ res, data: licensesDTO, message: "License information list" })
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
   * License 전체 정보 조회
   */
  getLicenses = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleLicenseGet({
      req,
      res,
      next,
      methodName: "getLicenses",
      errorMessage: "[License 전체 정보 조회] - 오류가 발생했습니다",
      serviceMethod: ({ filterOptions }) => this.licenseGetService.getLicenses({ filterOptions }),
    })
  }

  /**
   * License ID로 조회
   */

}