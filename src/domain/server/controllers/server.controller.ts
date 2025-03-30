import { NextFunction, Response } from "express"
import { ApiError } from "../../../errors/ApiError"
import { AppError } from "../../../errors/AppError"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ApiUtils } from "../../../utils/api/api.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerQueryFilterDTO } from "../dto/query/server-query-filter.dto"
import { SpecificServerFilterDTO } from "../dto/query/specific-server-filter.dto"
import { ServerResponseFactory } from "../dto/response/server-response-factory"
import { ServerFilterOptions } from "../types/server-filter.type"
import { ServerService } from "../services/server.service"
import { stringToBoolean } from "../../../utils/data-convert.util"

export class ServerController {
  private readonly serverService: ServerService

  constructor({ serverService }: { serverService: ServerService }) {
    this.serverService = serverService
  }

  //  server 조회 옵션 추출
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
      ContextLogger.debug({ message: `서버 목록 조회 요청` })

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

      ApiUtils.success({ res, data: serversDTOs, message: "server infomation list" })
    } catch (error) {
      ContextLogger.error({
        message: `서버 목록 조회 중 오류: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error : undefined,
      })
      // AppError는 toApiError로 변환하여 처리 (한 번의 체크로 모든 도메인 에러 처리)
      if (error instanceof AppError) {
        next(error.toApiError())
        return
      }

      // 이미 ApiError인 경우
      if (error instanceof ApiError) {
        next(error)
        return
      }

      // 기타 예상치 못한 에러
      next(
        ApiError.internal({
          message: "서버 목록 조회 중 예기치 않은 오류가 발생했습니다",
          details: process.env.NODE_ENV !== "production" ? { error: error instanceof Error ? error.message : String(error) } : undefined,
        })
      )
    }
  }

  /**
   * 서버 이름으로 정보 조회
   */
  // getServer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const { identifier } = req.params
  //     const query = req.query as unknown as SpecificServerFilterDTO
  //     const { identifierType } = query
  //     logger.debug(`서버 ${identifierType}로 정보 조회 요청: ${identifier}`)

  //     // 필터 옵션 추출
  //     const filterOptions = this.extractFilterOptions({ query })
  //     logger.debug(`적용된 필터 옵션: ${JSON.stringify(filterOptions)}`)

  //     // 서비스 호출
  //     let serverData
  //     if (filterOptions.identifierType === "id") {
  //       serverData = await this.serverService.getServerById({
  //         id: parseInt(identifier),
  //         filterOptions,
  //       })
  //     } else {
  //       serverData = await this.serverService.getServerByName({
  //         name: identifier,
  //         filterOptions,
  //       })
  //     }
  //     if (!serverData) {
  //       throw ServerError.notFound({})
  //     }
  //     //  출력 가공
  //     const serverDTO = ServerResponseFactory.createFromEntity({
  //       detail: filterOptions?.detail ?? false,
  //       serverData,
  //     })
  //     logger.info(`${identifierType}이(가) ${identifier}인 서버 정보 조회 완료. 상세 정보 포함: ${filterOptions.detail}`)

  //     ApiUtils.success({ res, data: serverDTO, message: "server information" })
  //   } catch (error) {
  //     if (error instanceof ServerError) next(error)
  //     else {
  //       logger.debug("Server 정보 조회 중 Controller 오류 발생")
  //       next(
  //         ServerError.getDataError({
  //           message: error.message,
  //           logMessage: ["Server 정보 조회 중 Controller.getServer() 오류 발생", error.logMessage],
  //         })
  //       )
  //     }
  //   }
  // }
}
