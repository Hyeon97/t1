import { NextFunction, Response } from "express"
import { ControllerError } from "../../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseController } from "../../../../utils/base/base-controller"
import { stringToBoolean } from "../../../../utils/data-convert.utils"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { BackupQueryFilterDTO } from "../../dto/query/backup-query-filter.dto"
import { SpecificBackupFilterDTO } from "../../dto/query/specific-backup-filter.dto"
import { BackupResponseFactory } from "../../dto/response/backup-response-factory"
import { BackupService } from "../../services/backup.service"
import { BackupFilterOptions } from "../../types/backup-filter.type"

export class BackupController extends BaseController {
  private readonly backupService: BackupService

  constructor({ backupService }: { backupService: BackupService }) {
    super({
      controllerName: "BackupController",
    })
    this.backupService = backupService
  }

  //  Backup 조회 옵션 추출
  private extractFilterOptions({ query }: { query: BackupQueryFilterDTO | SpecificBackupFilterDTO }): BackupFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: 'BackupController', method: 'extractFilterOptions', state: 'start' })
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
      if (query instanceof SpecificBackupFilterDTO) {
        filterOptions.identifierType = query.identifierType
      }
      asyncContextStorage.addOrder({ component: 'BackupController', method: 'extractFilterOptions', state: 'end' })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "Backup 필터 옵션을 추출하는 중 오류가 발생했습니다",
        cause: error,
      })
    }
  }

  /**
   * Backup 전체 정보 조회
   */
  getBackups = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ContextLogger.debug({ message: `Backup 작업 목록 조회 시작` })
      asyncContextStorage.setController({ name: 'BackupController' })
      asyncContextStorage.addOrder({ component: 'BackupController', method: 'getBackups', state: 'start' })

      // 필터 옵션 추출
      const query = req.query as unknown as BackupQueryFilterDTO
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
      asyncContextStorage.addOrder({ component: 'BackupController', method: 'getBackups', state: 'end' })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "getBackups",
        message: "Backup 작업 목록 조회 중 오류가 발생했습니다",
      })
    }
  }
}
