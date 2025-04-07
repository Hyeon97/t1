import { NextFunction, Response } from "express"
import { ControllerError } from "../../../../errors/controller/controller-error"
import { ExtendedRequest } from "../../../../types/common/req.types"
import { ApiUtils } from "../../../../utils/api/api.utils"
import { BaseController } from "../../../../utils/base/base-controller"
import { stringToBoolean } from "../../../../utils/data-convert.util"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { BackupQueryFilterDTO } from "../../dto/query/backup-query-filter.dto"
import { SpecificBackupFilterDTO } from "../../dto/query/specific-backup-filter.dto"
import { BackupResponseFactory } from "../../dto/response/backup-response-factory"
import { BackupService } from "../../services/backup.service"
import { BackupFilterOptions } from "../../types/backup-filter.type"

export class BackupController extends BaseController {
  private readonly backupService: BackupService
  // private readonly backupRegistService: BackupRegistService

  constructor({ backupService }: { backupService: BackupService }) {
    super({
      controllerName: "BackupController",
    })
    this.backupService = backupService
    // this.backupRegistService = backupRegistService
  }

  //  Backup 조회 옵션 추출
  private extractFilterOptions({ query }: { query: BackupQueryFilterDTO | SpecificBackupFilterDTO }): BackupFilterOptions {
    try {
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
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequestError({
        functionName: "extractFilterOptions",
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
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        functionName: "getBackups",
        message: "Backup 작업 목록 조회 중 오류가 발생했습니다",
      })
    }
  }
}
