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
import { BackupMonitoringByServerNameQueryDTO, BackupMonitoringQueryDTO } from "../../dto/query/backup-monit-query.dto"
import { BackupMonitoringFilterOptions } from "../../types/backup-monitoring.type"
import { BackupMonitoringService } from "../../services/backup-monitoring.service"
import { BackupMonitoringByJobNameDTO } from "../../dto/param/backup-monit-param.dto"

export class BackupMonitoringController extends BaseController {
  private readonly backupMonitoringService: BackupMonitoringService

  constructor({ backupMonitoringService }: { backupMonitoringService: BackupMonitoringService }) {
    super({
      controllerName: "BackupMonitoringController",
    })
    this.backupMonitoringService = backupMonitoringService
  }

  //  Backup 모니터링링 옵션 추출
  private extractFilterOptions({ query }: { query: BackupMonitoringQueryDTO }): BackupMonitoringFilterOptions {
    try {
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "start" })
      const filterOptions: BackupMonitoringFilterOptions = {
        //  필터
        mode: query.mode || "",
        partition: query.partition,
        repositoryType: query.repositoryType || "",
        repositoryPath: query.repositoryPath,
        //  상세 정보
        detail: query.detail ?? false,
      }
      //  작업 대상 server 이름으로 Monitoring 요청시에만 사용
      if (query instanceof BackupMonitoringByServerNameQueryDTO) {
        filterOptions.serverType = query.serverType || ""
      }
      asyncContextStorage.addOrder({ component: this.controllerName, method: "extractFilterOptions", state: "end" })
      return filterOptions
    } catch (error) {
      throw ControllerError.badRequest(ControllerError, {
        method: "extractFilterOptions",
        message: "[Backup 모니터링 필터 옵션 추출] - 필터 옵션 확인필요",
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

      // 파라미터 추출
      const params = req.params as unknown as BackupMonitoringByJobNameDTO
      ContextLogger.debug({ message: `파라미터터`, meta: params })

      // 필터 옵션 추출
      const query = req.query as unknown as BackupMonitoringQueryDTO
      const filterOptions = this.extractFilterOptions({ query })
      ContextLogger.debug({ message: `적용된 필터 옵션`, meta: filterOptions })

      //  서비스 호출
      const backupMonitData = await this.backupMonitoringService.monitByJobName({ jobName: params.jobName, filterOptions })

      // //  출력 가공
      // const backupsDTO = BackupResponseFactory.createFromEntities({
      //   detail: stringToBoolean({ value: filterOptions?.detail }),
      //   backupsData,
      // })
      ContextLogger.info({ message: `Backup 작업 이름으로 모니터링. 상세 정보 포함: ${filterOptions.detail}` })
      ApiUtils.success({ res, data: backupMonitData, message: "Backup infomation list" })
      asyncContextStorage.addOrder({ component: this.controllerName, method: "monitByJobName", state: "end" })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "monitByJobName",
        message: "[Backup 작업 이름으로 모니터링] - 예기치 못한 오류 발생",
      })
    }
  }
}
