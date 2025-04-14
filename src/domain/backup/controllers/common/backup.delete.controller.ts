import { NextFunction } from "express"
import { ControllerError } from "../../../../errors"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { BackupDeleteService } from "../../services/backup-delete.service"

export class BackupDeleteController extends BaseController {
  private readonly backupDeleteService: BackupDeleteService

  constructor({ backupDeleteService }: { backupDeleteService: BackupDeleteService }) {
    super({
      controllerName: "BackupDeleteController",
    })
    this.backupDeleteService = backupDeleteService
  }
  //  Backup 삭제 옵션 추출
  private extractFilterOptions() {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[Backup 삭제 필터 옵션 추출] - 오류가 발생했습니다",
        cause: error,
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
        message: "[Backup 작업 이름으로 삭제제] - 오류가 발생했습니다",
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
        message: "[Backup 작업 ID로 삭제] - 오류가 발생했습니다",
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
        message: "[Backup 작업 등록 System 이름으로 삭제] - 오류가 발생했습니다",
      })
    }
  }
}
