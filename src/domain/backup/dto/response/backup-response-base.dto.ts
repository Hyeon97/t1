///////////////////////////////
//  기본 Backup 정보 응답 DTO  //
///////////////////////////////

import { AllRepositoryType, RepositoryConnectionTypeMap } from "../../../../types/common/repository"
import { BackupTypeMap } from "../../../backup/types/backup-common.type"
import { BackupType } from "../../types/backup-common.type"
import { BackupDataResponse, BackupResponseFields, DEFAULT_VALUES_BACKUP_RESPONSE } from "../../types/backup-response.type"

export class BackupResponseBaseDTO implements BackupResponseFields {
  id: string
  jobName: string
  systemName: string
  partition: string
  mode: BackupType | string
  result: string
  schedule: {
    basic: string
    advanced: string
  }
  repository: {
    id: string
    type: AllRepositoryType | string
    path: string
  }
  timestamp: {
    start: string
    end: string
    elapsed: string
  }
  lastUpdate: string

  constructor({
    id = DEFAULT_VALUES_BACKUP_RESPONSE.id,
    jobName = DEFAULT_VALUES_BACKUP_RESPONSE.jobName,
    systemName = DEFAULT_VALUES_BACKUP_RESPONSE.systemName,
    partition = DEFAULT_VALUES_BACKUP_RESPONSE.partition,
    mode = DEFAULT_VALUES_BACKUP_RESPONSE.mode,
    result = DEFAULT_VALUES_BACKUP_RESPONSE.result,
    schedule = DEFAULT_VALUES_BACKUP_RESPONSE.schedule,
    repository = DEFAULT_VALUES_BACKUP_RESPONSE.repository,
    timestamp = DEFAULT_VALUES_BACKUP_RESPONSE.timestamp,
    lastUpdate = DEFAULT_VALUES_BACKUP_RESPONSE.lastUpdate,
  }: Partial<BackupResponseFields> = {}) {
    this.id = id
    this.jobName = jobName
    this.systemName = systemName
    this.partition = partition
    this.mode = mode
    this.result = result
    this.schedule = schedule
    this.repository = repository
    this.timestamp = timestamp
    this.lastUpdate = lastUpdate
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      jobName: this.jobName,
      systemName: this.systemName,
      partition: this.partition,
      mode: this.mode,
      result: this.result,
      schedule: this.schedule,
      repository: this.repository,
      timestamp: this.timestamp,
      lastUpdate: this.lastUpdate,
    }
  }

  /**
   * 엔티티에서 기본 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ backupData }: { backupData: BackupDataResponse }): BackupResponseBaseDTO {
    const { backup, info } = backupData

    return new BackupResponseBaseDTO({
      id: String(backup.nID),
      jobName: backup.sJobName,
      systemName: backup.sSystemName,
      partition: info.sDrive,
      mode: BackupTypeMap.toString({ value: info.nBackupType }),
      result: backup.sJobResult,
      schedule: {
        basic: backup.nScheduleID ? String(backup.nScheduleID) : DEFAULT_VALUES_BACKUP_RESPONSE.schedule.basic,
        advanced: backup.nScheduleID_advanced ? String(backup.nScheduleID_advanced) : DEFAULT_VALUES_BACKUP_RESPONSE.schedule.advanced,
      },
      repository: {
        id: String(info!.nRepositoryID),
        type: RepositoryConnectionTypeMap.toString({ value: info.nRepositoryType }),
        path: info!.sRepositoryPath,
      },
      timestamp: {
        start: backup.sStartTime as string,
        end: backup.sEndTime,
        elapsed: backup.sElapsedTime,
      },
      lastUpdate: backup.sLastUpdateTime as string,
    })
  }

  /**
   * 엔티티 배열에서 기본 DTO 배열로 변환
   */
  static fromEntities({ backupsData }: { backupsData: BackupDataResponse[] }): BackupResponseBaseDTO[] {
    return backupsData.map((backupData) => BackupResponseBaseDTO.fromEntity({ backupData }))
  }
}
