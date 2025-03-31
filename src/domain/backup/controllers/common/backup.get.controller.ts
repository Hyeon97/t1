import { NextFunction, Response } from "express"
import { BackupFilterDTO, BackupResponseDTOFactory, SpecificBackupFilterDTO } from "../../../dtos/backup/backup.dto"
import { JobError } from "../../../errors/domain-errors/backup-error"
import { BackupFilterOptions } from "../../../types/job/backup/backup.common"
import { BackupRegistRequestBody } from "../../../types/job/backup/backup.regist"
import { ExtendedRequest } from "../../../types/req.types"
import { ApiUtils } from "../../../utils/api.utils"
import { logger } from "../../../utils/logger"
import { BackupRegistService } from "../../services/backup/backup.regist.service"
import { BackupService } from "../../services/backup/backup.service"
import { backupRegistService, backupService } from "../../services/backup/services"

export class BackupController {
  private readonly backupService: BackupService
  private readonly backupRegistService: BackupRegistService

  constructor({ backupService, backupRegistService }: { backupService: BackupService; backupRegistService: BackupRegistService }) {
    this.backupService = backupService
    this.backupRegistService = backupRegistService
  }

  //  Backup 조회 옵션 추출
  private extractFilterOptions({ query }: { query: BackupFilterDTO | SpecificBackupFilterDTO }): BackupFilterOptions {
    const filterOptions: BackupFilterOptions = {
      //  필터 옵션
      mode: query.mode || "",
      partition: query.partition || "",
      status: query.status || "",
      result: query.result || "",
      repositoryID: query.repositoryID || null,
      repositoryType: query.repositoryType || "",
      repositoryPath: query.repositoryPath || "",
      //  추가정보
      detail: query.detail ?? false,
    }
    if (query instanceof SpecificBackupFilterDTO) {
      filterOptions.identifierType = query.identifierType
    }
    return filterOptions
  }

  /**
   * Backup 전체 정보 조회
   */
  getBackups = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("Backup 목록 조회 요청")

      // 필터 옵션 추출
      const query = req.query as unknown as BackupFilterDTO
      const filterOptions = this.extractFilterOptions({ query })
      logger.debug(`적용된 필터 옵션: ${JSON.stringify(filterOptions)}`)

      //  서비스 호출
      const backupsData = await this.backupService.getBackups({ filterOptions })

      //  출력 가공
      const backupsDTO = BackupResponseDTOFactory.createFromEntities({
        detail: filterOptions?.detail ?? false,
        backupsData,
      })
      logger.info(`총 ${backupsDTO.length}개의 Backup 정보를 조회했습니다. 상세 정보 포함: ${filterOptions.detail}`)

      ApiUtils.success({ res, data: backupsDTO, message: "Backup infomation list" })
    } catch (error: any) {
      if (error instanceof JobError) next(error)
      else {
        logger.debug("Backup 정보 조회 중 Controller 오류 발생")
        next(
          JobError.getDataError({
            message: error.message,
            logMessage: ["Backup 정보 조회 중 Controller.getBackups() 오류 발생", error.logMessage],
          })
        )
      }
    }
  }

  /**
   * Backup 작업 등록
   */
  regist = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.debug("Backup 정보 등록 요청")
      //  user data 추출
      const userData = req.user
      logger.debug(`등록 요청한 사용자 정보: ${JSON.stringify(userData)}`)
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