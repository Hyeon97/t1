import { NextFunction, Response } from "express"
import { ControllerError } from "../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseController } from "../../../utils/base/base-controller"
import { stringToBoolean } from "../../../utils/data-convert.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerQueryFilterDTO } from "../dto/query/server-query-filter.dto"
import { SpecificServerFilterDTO } from "../dto/query/specific-server-query-filter.dto"
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
  private extractFilterOptions({ query }: { query: SpecificServerFilterDTO | ServerQueryFilterDTO }): ServerFilterOptions {
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

      if (query instanceof SpecificServerFilterDTO) {
        filterOptions.identifierType = query.identifierType
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[Server 필터 옵션 추출] - 오류가 발생했습니다",
        error,
      })
    }
  }

  /**
   * 서버 전체 정보 조회
   */
  getServers = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `Server 목록 조회 시작` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getServers", state: "start" })

      // 필터 옵션 추출
      const query = req.query as unknown as ServerQueryFilterDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 서비스 호출
      const serversData = await this.serverGetService.getServers({ filterOptions })

      //  출력 가공
      const serversDTOs = ServerResponseFactory.createFromEntities({
        detail: stringToBoolean({ value: filterOptions?.detail }),
        serversData,
      })
      ContextLogger.info({ message: `총 ${serversData.length}개의 Server 정보를 조회했습니다. 상세 정보 포함: ${filterOptions.detail}` })
      ApiUtils.success({ res, data: serversDTOs, message: "Server infomation list" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getServers", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "getServers",
        message: "[Server 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 단일 서버 정보 조회 ( id or Name )
   */
  getServer = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `Server 정보 조회 시작` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getServer", state: "start" })
      //  파라미터 추출
      const { identifier } = req.params
      const query = req.query as unknown as SpecificServerFilterDTO
      const { identifierType } = query
      ContextLogger.debug({ message: `Server ${identifierType}로 정보 조회 요청: ${identifier}` })

      // 필터 옵션 추출
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // //  identifierType 값과 parameter의 indefier 값이 일치지 확인
      // if (filterOptions.identifierType === "id" && !regNumberOnly.test(identifier)) {
      //   throw ControllerError.badRequest(ControllerError, {
      //     method: "getServer",
      //     message: `Server ID는 숫자여야 합니다.`,
      //     metadata: {
      //       identifier,
      //       identifierType: filterOptions.identifierType,
      //     },
      //   })
      // }

      // 서비스 호출
      let serverData
      if (filterOptions.identifierType === "id") {
        serverData = await this.serverGetService.getServerById({
          id: identifier,
          filterOptions,
        })
      } else {
        serverData = await this.serverGetService.getServerByName({
          name: identifier,
          filterOptions,
        })
      }

      //  출력 가공
      const serverDTO = ServerResponseFactory.createFromEntity({
        detail: stringToBoolean({ value: filterOptions?.detail }),
        serverData,
      })
      ContextLogger.info({ message: `${identifierType}이(가) ${identifier}인 Server 정보 조회 완료. 상세 정보 포함: ${filterOptions.detail}` })
      ApiUtils.success({ res, data: serverDTO, message: "Server information" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "getServer", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "getServer",
        message: "[Server 정보 조회] - 오류가 발생했습니다",
      })
    }
  }
}
