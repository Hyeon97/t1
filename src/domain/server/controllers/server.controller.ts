import { NextFunction, Response } from "express"
import { ServerError } from "../../../errors/domain-errors/ServerError"
import { handleControllerError } from "../../../errors/handler/integration-error-handler"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { stringToBoolean } from "../../../utils/data-convert.util"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerQueryFilterDTO } from "../dto/query/server-query-filter.dto"
import { SpecificServerFilterDTO } from "../dto/query/specific-server-query-filter.dto"
import { ServerResponseFactory } from "../dto/response/server-response-factory"
import { ServerService } from "../services/server.service"
import { ServerFilterOptions } from "../types/server-filter.type"

export class ServerController {
  private readonly serverService: ServerService

  constructor({ serverService }: { serverService: ServerService }) {
    this.serverService = serverService
  }

  /**
   * server 조회 옵션 추출
   */
  private extractFilterOptions({ query }: { query: SpecificServerFilterDTO | ServerQueryFilterDTO }): ServerFilterOptions {
    const filterOptions: ServerFilterOptions = {
      mode: query.mode || "",
      os: query.os || "",
      network: query.network ?? false,
      disk: query.disk ?? false,
      partition: query.partition ?? false,
      repository: query.repository ?? false,
      connection: query.connection || "",
      license: query.license || "",
      detail: query.detail ?? false,
    }

    if (query instanceof SpecificServerFilterDTO) {
      filterOptions.identifierType = query.identifierType
    }
    return filterOptions
  }

  /**
   * 서버 전체 정보 조회
   */
  getServers = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `서버 목록 조회 시작` })

      // 필터 옵션 추출
      const query = req.query as unknown as ServerQueryFilterDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 서비스 호출
      const serversData = await this.serverService.getServers({ filterOptions })

      //  출력 가공
      const serversDTOs = ServerResponseFactory.createFromEntities({
        detail: stringToBoolean({ value: filterOptions?.detail }),
        serversData,
      })
      ContextLogger.info({ message: `총 ${serversData.length}개의 서버 정보를 조회했습니다. 상세 정보 포함: ${filterOptions.detail}` })

      ApiUtils.success({ res, data: serversDTOs, message: "Server infomation list" })
    } catch (error) {
      return handleControllerError({
        next,
        error,
        logErrorMessage: "서버 목록 조회 중 ServerController.getServers() 오류 발생",
        apiErrorMessage: "서버 목록 조회 중 오류가 발생했습니다",
        operation: "server 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ServerError.DataProcessingError(params),
      })
    }
  }

  /**
   * 단일 서버 정보 조회 ( id or Name )
   */
  getServer = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `서버 정보 조회 시작` })

      //  파라미터 추출
      const { identifier } = req.params
      const query = req.query as unknown as SpecificServerFilterDTO
      const { identifierType } = query
      ContextLogger.debug({ message: `서버 ${identifierType}로 정보 조회 요청: ${identifier}` })

      // 필터 옵션 추출
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 서비스 호출
      let serverData
      if (filterOptions.identifierType === "id") {
        serverData = await this.serverService.getServerById({
          id: identifier,
          filterOptions,
        })
      } else {
        serverData = await this.serverService.getServerByName({
          name: identifier,
          filterOptions,
        })
      }
      if (!serverData) {
        throw new ServerError.ServerNotFound({ server: identifier, type: identifierType })
      }
      //  출력 가공
      const serverDTO = ServerResponseFactory.createFromEntity({
        detail: stringToBoolean({ value: filterOptions?.detail }),
        serverData,
      })
      ContextLogger.info({ message: `${identifierType}이(가) ${identifier}인 서버 정보 조회 완료. 상세 정보 포함: ${filterOptions.detail}` })

      ApiUtils.success({ res, data: serverDTO, message: "Server information" })
    } catch (error) {
      return handleControllerError({
        next,
        error,
        logErrorMessage: "서버 정보 조회 중 ServerController.getServer() 오류 발생",
        apiErrorMessage: "서버 정보 조회 중 오류가 발생했습니다",
        operation: "단일 server 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ServerError.DataProcessingError(params),
      })
    }
  }
}
