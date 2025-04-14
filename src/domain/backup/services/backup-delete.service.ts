import { BaseService } from "../../../utils/base/base-service"
import { BackupInfoRepository } from "../repositories/backup-info.repository"
import { BackupRepository } from "../repositories/backup.repository"

export class BackupDeleteService extends BaseService {
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository
  // private readonly backupEventLogRepository:BackupEventLogRepository
  // private readonly backupHistoryRepository:BackupHistoryRepository

  constructor({ backupRepository, backupInfoRepository }: { backupRepository: BackupRepository; backupInfoRepository: BackupInfoRepository }) {
    super({
      serviceName: "BackupDeleteService",
    })
    this.backupRepository = backupRepository
    this.backupInfoRepository = backupInfoRepository
  }

  // /**
  //  * Backup 작업 이름으로 삭제
  //  */
  // deleteByJobName({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupDataResponse[]> {}
  // /**
  //  * Backup 작업 ID로 삭제
  //  */
  // deleteByJobId({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupDataResponse[]> {}
  // /**
  //  * Backup 작업 서버 이름으로 삭제 ( source, target 구분 X? )
  //  */
  // deleteBySystenName({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupDataResponse[]> {}
}
