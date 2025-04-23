import { NextFunction, Response } from "express"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { BackupDeleteByJobIdParamDTO, BackupDeleteByJobNameParamDTO, BackupDeleteByServerNameParamDTO } from "../../dto/param/backup-delete-param.dto"
import { BackupDeleteService } from "../../services/backup-delete.service"

export class BackupDeleteController extends BaseController {
  private readonly backupDeleteService: BackupDeleteService

  constructor({ backupDeleteService }: { backupDeleteService: BackupDeleteService }) {
    super({
      controllerName: "BackupDeleteController",
    })
    this.backupDeleteService = backupDeleteService
  }

  /**
   * 공통 Backup 삭제 헨들러 
   */
  private async handleBackupDelete<T>({
    req,
    res,
    next,
    methodName,
    paramExtractor,
    errorMessage,
  }: {
    req: ExtendedRequest
    res: Response
    next: NextFunction
    methodName: string
    paramExtractor: (params: any) => { jobId?: number; jobName?: string, serverName?: string }
    errorMessage: string
  }): Promise<void> {
    try {
      ContextLogger.debug({ message: `Backup 작업 삭제 시작 - ${methodName}` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: methodName, state: "start" })

      // 파라미터 추출 ( jobId || jobName || serverName )
      const params = req.params as unknown as T
      const identifier = paramExtractor(params)
      ContextLogger.debug({ message: `[식별자]`, meta: identifier! })


      //  서비스 호출
      let resultData
      if (identifier.jobName) {
        resultData = await this.backupDeleteService.deleteByJobName({ jobName: identifier.jobName })
      } else if (identifier.jobId) {
        resultData = await this.backupDeleteService.deleteBackupByJobId({ jobId: identifier.jobId })
      }

      ContextLogger.info({ message: `Backup 작업 삭제 완료` })
      ApiUtils.success({ res, data: resultData, message: "Backup job data delete result" })
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
   * Backup 작업 이름으로 삭제
   */
  deleteByJobName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupDelete<BackupDeleteByJobNameParamDTO>({
      req, res, next,
      methodName: "deleteByJobName",
      paramExtractor: (params) => ({ jobName: params.jobName }),
      errorMessage: "[Backup 작업 이름으로 삭제] - 예기치 못한 오류 발생",
    })
  }

  /**
   * Backup 작업 ID로 삭제
   */
  deleteByJobId = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupDelete<BackupDeleteByJobIdParamDTO>({
      req, res, next,
      methodName: "deleteByJobId",
      paramExtractor: (params) => ({ jobName: params.jobName }),
      errorMessage: "[Backup 작업 ID로 삭제] - 예기치 못한 오류 발생",
    })
  }

  /**
   * Backup 작업 서버 이름으로 삭제 ( source, target 구분 X? )
   */
  deleteBySystenName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    await this.handleBackupDelete<BackupDeleteByServerNameParamDTO>({
      req, res, next,
      methodName: "deleteBySystenName",
      paramExtractor: (params) => ({ jobName: params.jobName }),
      errorMessage: "[Backup 작업 등록 System 이름으로 삭제] - 예기치 못한 오류 발생",
    })
  }
}
