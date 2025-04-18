import { ControllerError } from "../../../../errors"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { BackupGetQueryDTO } from "../../dto/query/backup-get-query.dto"
import { BackupRegistService } from "../../services/backup-regist.service"
import { BackupService } from "../../services/backup.service"
import { BackupFilterOptions } from "../../types/backup-get.type"

export class BackupMonitoringController extends BaseController {
  private readonly backupService: BackupService
  private readonly backupRegistService: BackupRegistService

  constructor({ backupService, backupRegistService }: { backupService: BackupService; backupRegistService: BackupRegistService }) {
    super({
      controllerName: "BackupMonitoringController",
    })
    this.backupService = backupService
    this.backupRegistService = backupRegistService
  }

  //  Backup 모니터링링 옵션 추출
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
      if (query instanceof BackupGetQueryDTO) {
        // filterOptions.identifierType = query.identifierType
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[Backup 조회 필터 옵션 추출] - 필터 옵션 확인필요",
        error,
      })
    }
  }
}
