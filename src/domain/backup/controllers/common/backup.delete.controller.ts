import { NextFunction, Response } from "express"
import { ControllerError } from "../../../../errors"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { BackupDeleteQueryDTO } from "../../dto/query/delete-backup-filter.dto"
import { BackupDeleteService } from "../../services/backup-delete.service"
import { BackupDeleteOptions } from "../../types/backup-delete.type"

export class BackupDeleteController extends BaseController {
  private readonly backupDeleteService: BackupDeleteService

  constructor({ backupDeleteService }: { backupDeleteService: BackupDeleteService }) {
    super({
      controllerName: "BackupDeleteController",
    })
    this.backupDeleteService = backupDeleteService
  }
  //  Backup 삭제 옵션 추출
  private extractFilterOptions({ query }: { query: BackupDeleteQueryDTO }): BackupDeleteOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: BackupDeleteOptions = {
        jobName: query.jobName || '',
        id: query.id || null
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[Backup 삭제 필터 옵션 추출] - 팔터 옵션 확인필요",
        error,
      })
    }
  }

  /**
   * Backup 작업 삭제 
   */
  delete = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "deleteByJobName", state: "start" })

      //  필터 옵션 추출
      const query = req.query as unknown as BackupDeleteQueryDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })
      //  서비스 호출
      let resultData
      if (filterOptions.jobName) {
        resultData = await this.backupDeleteService.deleteByJobName({
          jobName: filterOptions.jobName,
          filterOptions
        })
      } else if (filterOptions.id) {
        resultData = await this.backupDeleteService.deleteBackupByJobId({
          id: filterOptions.id,
          filterOptions
        })
      }
      ContextLogger.info({ message: `Backup 작업 삭제 완료` })
      ApiUtils.success({ res, data: resultData, message: "Backup job data delete result" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "deleteByJobName", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "delete",
        message: "[Backup 작업 삭제] - 예기치 못한 오류 발생",
      })
    }
  }

  /**
   * Backup 작업 이름으로 삭제
   */
  deleteByJobName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "deleteByJobName", state: "start" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "deleteByJobName", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "deleteByJobName",
        message: "[Backup 작업 이름으로 삭제] - 예기치 못한 오류 발생",
      })
    }
  }

  /**
   * Backup 작업 ID로 삭제
   */
  deleteByJobId = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "deleteByJobId", state: "start" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "deleteByJobId", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "deleteByJobId",
        message: "[Backup 작업 ID로 삭제] - 예기치 못한 오류 발생",
      })
    }
  }

  /**
   * Backup 작업 서버 이름으로 삭제 ( source, target 구분 X? )
   */
  deleteBySystenName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "deleteBySystenName", state: "start" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "deleteBySystenName", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "deleteBySystenName",
        message: "[Backup 작업 등록 System 이름으로 삭제] - 예기치 못한 오류 발생",
      })
    }
  }
}
