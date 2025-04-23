import { NextFunction, Response } from "express"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { BackupEditByJobIdParamDTO, BackupEditByJobNameParamDTO } from "../../dto/param/backup-edit-param.dto"
import { BackupEditService } from "../../services/backup-edit.service"
import { BackupEditRequestBody } from "../../types/backup-edit.type"

export class BackupEditController extends BaseController {
  private readonly backupEditService: BackupEditService

  constructor({ backupEditService }: { backupEditService: BackupEditService }) {
    super({
      controllerName: "BackupEditController",
    })
    this.backupEditService = backupEditService
  }

  /**
   * 공통 Backup 편집 핸들러
   */
  private async handleBackupEdit<T>({
    req, res, next,
    methodName,
    paramExtractor,
    errorMessage,
  }: {
    req: ExtendedRequest
    res: Response
    next: NextFunction
    methodName: string
    paramExtractor: (params: any) => { jobId?: number; jobName?: string }
    errorMessage: string
  }): Promise<void> {
    try {
      ContextLogger.debug({ message: `Backup 작업 수정 시작 - ${methodName}` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: methodName, state: "start" })

      // 파라미터 추출 ( jobId || jobName )
      const params = req.params as unknown as T
      const identifier = paramExtractor(params)
      ContextLogger.debug({ message: `[파라미터]`, meta: identifier! })

      // body data 추출
      const data = req.body as BackupEditRequestBody

      // 서비스 호출
      const resultData = await this.backupEditService.edit({ ...identifier, data })

      // 출력 가공
      ApiUtils.success({ res, data: resultData, message: "Backup job data edit result" })
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
   * Backup 작업 이름으로 수정
   */
  editByJobName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupEdit<BackupEditByJobNameParamDTO>({
      req, res, next,
      methodName: "editByJobName",
      paramExtractor: (params) => ({ jobName: params.jobName }),
      errorMessage: "[Backup 작업 이름으로 수정] - 예기치 못한 오류 발생",
    })
  }

  /**
   * Backup 작업 ID로 수정
   */
  editByJobId = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupEdit<BackupEditByJobIdParamDTO>({
      req, res, next,
      methodName: "editByJobId",
      paramExtractor: (params) => ({ jobId: Number(params.jobId) }),
      errorMessage: "[Backup 작업 ID로 수정] - 예기치 못한 오류 발생",
    })
  }
}
