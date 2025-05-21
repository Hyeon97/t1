import { NextFunction, Response } from "express"
import { ControllerError } from "../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { stringToBoolean } from "../../../utils/data-convert.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerGetByIdDTO, ServerGetByNameDTO } from "../dto/param/server-get-param.dto"
import { ServerGetQueryDTO } from "../dto/query/server-get-query"
import { ServerResponseFactory } from "../dto/response/server-response-factory"
import { ServerGetService } from "../services/server-get.service"
import { ServerFilterOptions } from "../types/server-filter.type"

export class ServerGetController extends BaseController {
  private readonly serverGetService: ServerGetService

  constructor({ serverGetService }: { serverGetService: ServerGetService }) {
    super({
      controllerName: "ServerGetController",
    })
    this.serverGetService = serverGetService
  }

  /**
   * server 조회 옵션 추출
   */
  private extractFilterOptions({ query }: { query: ServerGetQueryDTO }): ServerFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: ServerFilterOptions = {
        //  필터
        mode: query.mode || "",
        os: query.os || "",
        //  추가 정보
        network: query.network ?? false,
        disk: query.disk ?? false,
        partition: query.partition ?? false,
        repository: query.repository ?? false,
        connection: query.connection || "",
        license: query.license || "",
        //  상세 정보
        detail: query.detail ?? false,
      }

      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[Server 정보 조회 필터 옵션 추출] - 오류가 발생했습니다",
        error,
      })
    }
  }

  /**
   * 공통 Server 정보 조회 핸들러 
   */
  private async handleServerGet<T>({
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
    paramExtractor?: (params: any) => { serverId?: number; serverName?: string }
    serviceMethod: (params: any) => Promise<any>
  }): Promise<void> {
    try {
      ContextLogger.debug({ message: `Server 정보 조회 시작 - ${methodName}` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: methodName, state: "start" })

      // 필터 옵션 추출
      const query = req.query as unknown as ServerGetQueryDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 파라미터 추출
      let identifier = {}
      let identifierValue: any
      let identifierType = ""

      if (paramExtractor) {
        identifier = paramExtractor(req.params)
        if ('serverId' in identifier && identifier.serverId !== undefined) {
          identifierValue = identifier.serverId
          identifierType = "id"
        } else if ('serverName' in identifier && identifier.serverName !== undefined) {
          identifierValue = identifier.serverName
          identifierType = "name"
        }
        ContextLogger.debug({ message: `[식별자] ${identifierType}: ${identifierValue}`, meta: identifier })
      }

      // 서비스 호출
      const serversData = await serviceMethod({ ...identifier, filterOptions })

      // 출력 가공 및 로깅
      const { responseData, resultMessage, responseMessage } = this.processServerResponse({
        serversData,
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
   * 서버 응답 데이터 생성 및 로깅
   */
  private processServerResponse({
    serversData,
    filterOptions,
    identifierType,
    identifierValue
  }: {
    serversData: any | any[]
    filterOptions: ServerFilterOptions
    identifierType?: string
    identifierValue?: string | number
  }): {
    responseData: any
    resultMessage: string
    responseMessage: string
  } {
    const isDetailIncluded = stringToBoolean({ value: filterOptions?.detail })

    // 배열인 경우 목록 조회로 간주
    if (Array.isArray(serversData)) {
      const responseData = ServerResponseFactory.createFromEntities({
        detail: isDetailIncluded,
        serversData,
      })

      const resultMessage = `총 ${serversData.length}개의 Server 정보를 조회했습니다. 상세 정보 포함: ${isDetailIncluded}`
      return {
        responseData,
        resultMessage,
        responseMessage: "Server information list"
      }
    }
    // 단일 서버 조회인 경우
    else {
      const responseData = ServerResponseFactory.createFromEntity({
        detail: isDetailIncluded,
        serverData: serversData,
      })

      let resultMessage = `Server 정보 조회 완료. 상세 정보 포함: ${isDetailIncluded}`
      if (identifierType && identifierValue) {
        resultMessage = `${identifierType}이(가) ${identifierValue}인 Server 정보 조회 완료. 상세 정보 포함: ${isDetailIncluded}`
      }

      return {
        responseData,
        resultMessage,
        responseMessage: "Server information"
      }
    }
  }

  /**
   * 서버 전체 정보 조회
   */
  getServers = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleServerGet({
      req,
      res,
      next,
      methodName: 'getServers',
      errorMessage: '[Server 목록 조회] - 예기치 못한 오류 발생',
      serviceMethod: ({ filterOptions }) => this.serverGetService.getServers({ filterOptions })
    })
  }

  /**
   * Server ID로 조회 
   */
  getServerById = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleServerGet({
      req,
      res,
      next,
      methodName: 'getServerById',
      errorMessage: '[Server 정보 조회] - 예기치 못한 오류 발생',
      paramExtractor: (params) => {
        const { serverId } = params as ServerGetByIdDTO
        return { serverId }
      },
      serviceMethod: ({ serverId, filterOptions }) =>
        this.serverGetService.getServerById({ id: serverId, filterOptions })
    })
  }

  /**
   * Server Name으로 조회
   */
  getServerByName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleServerGet({
      req,
      res,
      next,
      methodName: 'getServerByName',
      errorMessage: '[Server 정보 조회] - 예기치 못한 오류 발생',
      paramExtractor: (params) => {
        const { serverName } = params as ServerGetByNameDTO
        return { serverName }
      },
      serviceMethod: ({ serverName, filterOptions }) =>
        this.serverGetService.getServerByName({ name: serverName, filterOptions })
    })
  }
}
