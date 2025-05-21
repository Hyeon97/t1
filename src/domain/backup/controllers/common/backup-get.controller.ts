import { NextFunction, Response } from "express"
import { ControllerError } from "../../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { stringToBoolean } from "../../../../utils/data-convert.utils"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { BackupGetByJobIdParamDTO, BackupGetByJobNameParamDTO, BackupGetByServerNameParamDTO } from "../../dto/param/backup-get-param.dto"
import { BackupGetByServerNameQueryDTO, BackupGetQueryDTO } from "../../dto/query/backup-get-query.dto"
import { BackupResponseFactory } from "../../dto/response/backup-response-factory"
import { BackupGetService } from "../../services/common/backup-get.service"
import { BackupFilterOptions } from "../../types/backup-get.type"

export class BackupGetController extends BaseController {
  private readonly backupGetService: BackupGetService

  constructor({ backupGetService }: { backupGetService: BackupGetService }) {
    super({
      controllerName: "BackupGetController",
    })
    this.backupGetService = backupGetService
  }

  //  Backup 조회 옵션 추출
  private extractFilterOptions({ query }: { query: BackupGetQueryDTO }): BackupFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: BackupFilterOptions = {
        //  필터
        mode: query.mode || "",
        partition: query.partition || "",
        status: query.status || "",
        result: query.result || "",
        repositoryID: query.repositoryID || null,
        repositoryType: query.repositoryType || "",
        repositoryPath: query.repositoryPath || "",
        //  상세 정보
        detail: query.detail ?? false,
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[Backup 정보 조회 필터 옵션 추출] - 필터 옵션 확인필요",
        error,
      })
    }
  }

  /**
   * 공통 Backup 정보 조회 핸들러
   */
  private async handleBackupGet<T>({
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
    paramExtractor?: (params: any) => { jobId?: number; jobName?: string; serverName?: string }
    serviceMethod: (params: any) => Promise<any>
  }): Promise<void> {
    try {
      ContextLogger.debug({ message: `Backup 작업 정보 조회 시작 - ${methodName}` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: methodName, state: "start" })

      // 필터 옵션 추출
      const query = req.query as unknown as BackupGetQueryDTO | BackupGetByServerNameQueryDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      // 파라미터 추출 (필요한 경우)
      let identifier = {}
      if (paramExtractor) {
        const params = req.params as unknown as T
        identifier = paramExtractor(params)
        ContextLogger.debug({ message: `[식별자]`, meta: identifier })
      }

      // 서비스 호출
      const backupsData = await serviceMethod({ ...identifier, filterOptions })

      // 출력 가공
      const backupsDTO = BackupResponseFactory.createFromEntities({
        detail: stringToBoolean({ value: filterOptions?.detail }),
        backupsData: Array.isArray(backupsData) ? backupsData : [backupsData],
      })

      const resultMessage = `총 ${Array.isArray(backupsData) ? backupsData.length : 1}개의 Backup 작업 정보를 조회했습니다. 상세 정보 포함: ${filterOptions.detail}`
      ContextLogger.info({ message: resultMessage })

      ApiUtils.success({ res, data: backupsDTO, message: "Backup information list" })
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
   * Backup 전체 정보 조회
   */
  getBackups = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupGet({
      req,
      res,
      next,
      methodName: "getBackups",
      errorMessage: "[Backup 작업 목록 조회] - 예기치 못한 오류 발생",
      serviceMethod: ({ filterOptions }) => this.backupGetService.getBackups({ filterOptions }),
    })
  }

  /**
   * Backup 작업 ID로 조회
   */
  getBackupByJobId = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupGet<BackupGetByJobIdParamDTO>({
      req, res, next,
      methodName: "getBackupByJobId",
      paramExtractor: (params) => ({ jobId: params.jobId }),
      errorMessage: "[Backup 작업 ID로 조회] - 예기치 못한 오류 발생",
      serviceMethod: ({ jobId, filterOptions }) => this.backupGetService.getBackupById({ id: jobId, filterOptions }),
    })
  }

  /**
   * Backup 작업 이름으로 조회
   */
  getBackupByJobName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupGet<BackupGetByJobNameParamDTO>({
      req, res, next,
      methodName: "getBackupByJobName",
      paramExtractor: (params) => ({ jobName: params.jobName }),
      errorMessage: "[Backup 작업 이름으로 조회] - 예기치 못한 오류 발생",
      serviceMethod: ({ jobName, filterOptions }) => this.backupGetService.getBackupByName({ name: jobName, filterOptions }),
    })
  }

  /**
   * Backup 작업 서버 이름으로 조회
   */
  getBackupByServerName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupGet<BackupGetByServerNameParamDTO>({
      req, res, next,
      methodName: "getBackupByServerName",
      paramExtractor: (params) => ({ serverName: params.serverName }),
      errorMessage: "[Backup 작업 서버 이름으로 조회] - 예기치 못한 오류 발생",
      serviceMethod: ({ serverName, filterOptions }) => this.backupGetService.getBackupsByServerName({ serverName, filterOptions }),
    })
  }
}
