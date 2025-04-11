import { NextFunction, Response } from "express"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { BackupRegistService } from "../../services/backup-regist.service"
import { BackupService } from "../../services/backup.service"
import { BackupRegistRequestBody } from "../../types/backup-regist.type"

export class BackupRegistController extends BaseController {
  private readonly backupService: BackupService
  private readonly backupRegistService: BackupRegistService

  constructor({ backupService, backupRegistService }: { backupService: BackupService; backupRegistService: BackupRegistService }) {
    super({
      controllerName: "BackupRegistController",
    })
    this.backupService = backupService
    this.backupRegistService = backupRegistService
  }

  /**
   * Backup 작업 등록
   */
  regist = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `Backup 작업 정보 등록 시작` })
      asyncContextStorage.setController({ name: 'BackupRegistController' })
      asyncContextStorage.addOrder({ component: 'BackupRegistController', method: 'regist', state: 'start' })

      //  user data 추출
      const userData = req.user
      ContextLogger.debug({ message: `요청 사용자 정보`, meta: userData })

      //  body data 추출
      const data = req.body as BackupRegistRequestBody
      if (!data.user) data.user = userData?.email

      //  서비스 호출
      const resultData = await this.backupRegistService.regist({ data })

      //  출력 가공
      ApiUtils.success({ res, data: resultData, message: "Backup job data regist result" })
      asyncContextStorage.addOrder({ component: 'BackupRegistController', method: 'regist', state: 'end' })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "regist",
        message: "Backup 작업 정보 등록 중 오류가 발생했습니다",
      })
    }
  }
}
