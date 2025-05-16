import { NextFunction, Response } from "express"
import { ControllerError } from "../../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { stringToBoolean } from "../../../../utils/data-convert.utils"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { ZdmGetByIdDTO, ZdmGetByNameDTO } from "../../dto/param/zdm-get-param.dto"
import { ZdmGetQueryDTO } from "../../dto/query/zdm/zdm-query-filter.dto"
import { ZdmResponseFactory } from "../../dto/response/zdm-response-factory"
import { ZdmGetService } from "../../services/common/zdm-get.service"
import { ZdmFilterOptions } from "../../types/zdm/zdm-filter.type"

export class ZdmGetController extends BaseController {
  private readonly zdmGetService: ZdmGetService
  constructor({ zdmGetService }: { zdmGetService: ZdmGetService }) {
    super({
      controllerName: "ZdmGetController",
    })
    this.zdmGetService = zdmGetService
  }

  /**
   * zdm 조회 옵션 추출
   */
  private extractFilterOptions({ query }: { query: ZdmGetQueryDTO }): ZdmFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: ZdmFilterOptions = {
        //  필터
        connection: query.connection || "",
        activation: query.activation || "",
        //  추가 정보
        network: query.network ?? false,
        disk: query.disk ?? false,
        partition: query.partition ?? false,
        repository: query.repository ?? false,
        zosRepository: query.zosRepository ?? false,
        //  상세 정보
        detail: query.detail ?? false,
      }

      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[ZDM 정보 조회 필터 옵션 추출] - 오류가 발생했습니다",
        error,
      })
    }
  }

  /**
   * 공통 Zdm 정보 조회 핸들러 
   */
  private async handleZdmGet<T>({
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
    paramExtractor?: (params: any) => { zdmId?: number; zdmName?: string }
    serviceMethod: (params: any) => Promise<any>
  }): Promise<void> {
    try {
      ContextLogger.debug({ message: `ZDM 정보 조회 시작 - ${methodName}` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: methodName, state: "start" })

      // 필터 옵션 추출
      const query = req.query as unknown as ZdmGetQueryDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 파라미터 추출
      let identifier = {}
      let identifierValue: any
      let identifierType = ""

      if (paramExtractor) {
        identifier = paramExtractor(req.params)
        if ('zdmId' in identifier && identifier.zdmId !== undefined) {
          identifierValue = identifier.zdmId
          identifierType = "id"
        } else if ('zdmName' in identifier && identifier.zdmName !== undefined) {
          identifierValue = identifier.zdmName
          identifierType = "name"
        }
        ContextLogger.debug({ message: `[식별자] ${identifierType}: ${identifierValue}`, meta: identifier })
      }

      // 서비스 호출
      const zdmsData = await serviceMethod({ ...identifier, filterOptions })

      // 출력 가공 및 로깅
      const { responseData, resultMessage, responseMessage } = this.processZdmResponse({
        zdmsData,
        filterOptions,
        identifierType,
        identifierValue
      })

      ContextLogger.info({ message: resultMessage })
      ApiUtils.success({ res, data: responseData, message: responseMessage })
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
   * Zdm 응답 데이터 생성 및 로깅
   */
  private processZdmResponse({
    zdmsData,
    filterOptions,
    identifierType,
    identifierValue
  }: {
    zdmsData: any | any[]
    filterOptions: ZdmFilterOptions
    identifierType?: string
    identifierValue?: string | number
  }): {
    responseData: any
    resultMessage: string
    responseMessage: string
  } {
    const isDetailIncluded = stringToBoolean({ value: filterOptions?.detail })

    // 배열인 경우 목록 조회로 간주
    if (Array.isArray(zdmsData)) {
      const responseData = ZdmResponseFactory.createFromEntities({
        detail: isDetailIncluded,
        zdmsData,
      })

      const resultMessage = `총 ${zdmsData.length}개의 Zdm 정보를 조회했습니다. 상세 정보 포함: ${isDetailIncluded}`
      return {
        responseData,
        resultMessage,
        responseMessage: "Zdm information list"
      }
    }
    // 단일 센터 조회인 경우
    else {
      const responseData = ZdmResponseFactory.createFromEntity({
        detail: isDetailIncluded,
        zdmData: zdmsData,
      })

      let resultMessage = `Zdm 정보 조회 완료. 상세 정보 포함: ${isDetailIncluded}`
      if (identifierType && identifierValue) {
        resultMessage = `${identifierType}이(가) ${identifierValue}인 Zdm 정보 조회 완료. 상세 정보 포함: ${isDetailIncluded}`
      }

      return {
        responseData,
        resultMessage,
        responseMessage: "Zdm information"
      }
    }
  }

  /**
   * Zdm 전체 정보 조회
   */
  getZdms = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleZdmGet({
      req,
      res,
      next,
      methodName: 'getZdms',
      errorMessage: '[ZDM 목록 조회] - 예기치 못한 오류 발생',
      serviceMethod: ({ filterOptions }) => this.zdmGetService.getZdms({ filterOptions })
    })
  }

  /**
   * Zdm ID로 조회
   */
  getZdmById = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleZdmGet({
      req,
      res,
      next,
      methodName: 'getZdmById',
      errorMessage: '[Zdm 정보 조회] - 예기치 못한 오류 발생',
      paramExtractor: (params) => {
        const { zdmId } = params as ZdmGetByIdDTO
        return { zdmId }
      },
      serviceMethod: ({ zdmId, filterOptions }) =>
        this.zdmGetService.getZdmById({ id: zdmId, filterOptions })
    })
  }

  /**
   * Zdm Name으로 조회
   */
  getZdmByName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleZdmGet({
      req,
      res,
      next,
      methodName: 'getZdmByName',
      errorMessage: '[Zdm 정보 조회] - 예기치 못한 오류 발생',
      paramExtractor: (params) => {
        const { zdmName } = params as ZdmGetByNameDTO
        return { zdmName }
      },
      serviceMethod: ({ zdmName, filterOptions }) =>
        this.zdmGetService.getZdmByName({ name: zdmName, filterOptions })
    })
  }
}

