import { BackupActiveRepository } from "./../repositories/backup-active.repository"
import { BaseService } from "../../../utils/base/base-service"
import { BackupInfoRepository } from "../repositories/backup-info.repository"
import { BackupRepository } from "../repositories/backup.repository"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BackupMonitoringFilterOptions } from "../types/backup-monitoring.type"
import { BackupDataMonitoringResponse } from "../types/backup-response.type"
import { BackupTable } from "../types/db/job-backup"
import { BackupInfoTable } from "../types/db/job-backup-info"
import { BackupActiveTable } from "../types/db/active-backup"

export class BackupMonitoringService extends BaseService {
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository
  private readonly backupActiveRepository: BackupActiveRepository
  constructor({
    backupRepository,
    backupInfoRepository,
    backupActiveRepository,
  }: {
    backupRepository: BackupRepository
    backupInfoRepository: BackupInfoRepository
    backupActiveRepository: BackupActiveRepository
  }) {
    super({
      serviceName: "BackupMonitoringService",
    })
    this.backupRepository = backupRepository
    this.backupInfoRepository = backupInfoRepository
    this.backupActiveRepository = backupActiveRepository
  }

  /**
   * 결과 확인 및 출력 결과 가공
   */
  private processResult({
    jobName,
    backup,
    backupInfo,
    backupActive,
  }: {
    jobName?: string
    backup: BackupTable
    backupInfo: BackupInfoTable
    backupActive: BackupActiveTable
  }): BackupDataMonitoringResponse | null {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processResult", state: "start" })
      let returnObject: BackupDataMonitoringResponse | null = null
      if (jobName) {
        returnObject = {
          job_name: jobName,
          job_id: String(backup.nID),
          monitoring_data: {
            SystemName: backup.sSystemName,
            JobName: backup.sJobName,
            JobID: backup.nJobID,
            JobResult: backup.sJobResult || "-",
            JobStatusType: backup.nJobStatus,
            BackupType: backupInfo ? backupInfo.nBackupType : "-",
            Drive: backupInfo ? backupInfo.sDrive : "-",
            Percent: backupActive ? backupActive.nPercent : "-",
            StartTime: backup.sStartTime,
            ElapsedTime: backup.sElapsedTime,
            EndTime: backup.sEndTime,
          },
        }
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processResult", state: "start" })
      return returnObject
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "processResult",
        message: `[Backup 모니터링] - 출력데이터 생성 실패`,
      })
    }
  }

  /**
   * Backup 작업 이름으로 모니터링
   */
  async monitByJobName({ jobName, filterOptions }: { jobName: string; filterOptions: BackupMonitoringFilterOptions }): Promise<any> {
    // Promise<BackupDataMonitoringResponse>
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "monitByJobName", state: "start" })

      //  1.  job_backup table에서 데이터 가져옴
      const backup =
        (
          await this.backupRepository.findByJobName({
            jobName,
            filterOptions,
          })
        )[0] || null
      //  2.  backupData 갯수만큼 job_backup, active_backup 테이블에서 정보 가져옴
      const backupInfo =
        (
          await this.backupInfoRepository.findByJobName({
            jobName,
            filterOptions,
          })
        )[0] || null
      const backupActive =
        (
          await this.backupActiveRepository.findByJobName({
            jobName,
            filterOptions,
          })
        )[0] || null
      //  출력 가공
      const result = this.processResult({ jobName, backup, backupInfo, backupActive })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "monitByJobName", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "monitByJobName",
        message: `[Backup 작업 이름으로 모니터링] - 예기치 못한 오류 발생`,
      })
    }
  }

  /**
   * Backup 작업 ID로 모니터링
   */

  /**
   * Backup 작업 대상 서버 이름으로 모니터링
   */
}
