import { NextFunction, Response } from "express"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { JobError } from "../../../errors/domain-errors/backup-error"
import { BackupRegistRequestBody } from "../../../types/job/backup/backup.regist"
import { ExtendedRequest } from "../../../types/req.types"
import { ApiUtils } from "../../../utils/api.utils"
import { logger } from "../../../utils/logger"
import { BackupRegistService } from "../../services/backup/backup.regist.service"
import { BackupService } from "../../services/backup/backup.service"
import { backupRegistService, backupService } from "../../services/backup/services"

export class BackupRegistController {
  private readonly backupService: BackupService
  private readonly backupRegistService: BackupRegistService

  constructor({ backupService, backupRegistService }: { backupService: BackupService; backupRegistService: BackupRegistService }) {
    this.backupService = backupService
    this.backupRegistService = backupRegistService
  }

  /**
   * Backup 작업 등록
   */
  regist = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `Backup 작업 정보 등록 시작` })

      //  user data 추출
      const userData = req.user
      ContextLogger.debug({ message: `요청 사용자 정보`, meta: userData })

      //  body data 추출
      const data = req.body as BackupRegistRequestBody
      if (!data.user) data.user = userData?.email

      //  서비스 호출
      const resultData = await this.backupRegistService.regist({ data })

      //  출력 가공
      const result = {
        backupName: "test backup name",
      }
      ApiUtils.success({ res, data: result, message: "Backup data regist success" })
    } catch (error: any) {
      if (error instanceof JobError) next(error)
      else {
        logger.debug("Backup 정보 등록 중 Controller 오류 발생")
        next(
          JobError.getDataError({
            message: error.message,
            logMessage: ["Backup 정보 조회 중 Controller.regist() 오류 발생", error.logMessage],
          })
        )
      }
    }
  }
}

export const backupController = new BackupController({
  backupService,
  backupRegistService,
})