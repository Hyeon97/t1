import { NextFunction, Response } from "express"
import { ControllerError } from "../../../../errors"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { stringToBoolean } from "../../../../utils/data-convert.utils"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { BackupGetQueryDTO } from "../../dto/query/backup-get-query.dto"
import { BackupResponseFactory } from "../../dto/response/backup-response-factory"
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

  /**
   * Backup 작업 이름으로 모니터링
   */
  monitByJobName = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `Backup 작업 이름으로 모니터링 시작` })
      asyncContextStorage.setController({ name: this.controllerName })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "monitByJobName", state: "start" })

      // 필터 옵션 추출
      const query = req.query as unknown as BackupGetQueryDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      //  서비스 호출
      const backupsData = await this.backupService.getBackups({ filterOptions })

      //  출력 가공
      const backupsDTO = BackupResponseFactory.createFromEntities({
        detail: stringToBoolean({ value: filterOptions?.detail }),
        backupsData,
      })
      ContextLogger.info({ message: `총 ${backupsData.length}개의 Backup 작업 정보를 조회했습니다. 상세 정보 포함: ${filterOptions.detail}` })
      ApiUtils.success({ res, data: backupsDTO, message: "Backup infomation list" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "monitByJobName", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "getBackups",
        message: "[Backup 작업 목록 조회] - 예기치 못한 오류 발생",
      })
    }
  }
}
