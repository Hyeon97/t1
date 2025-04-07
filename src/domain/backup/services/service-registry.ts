//////////////////////////////////
//  Backup Service 선언 및 관리  //
//////////////////////////////////

import { BackupInfoRepository } from "../repositories/backup-info.repository"
import { BackupRepository } from "../repositories/backup.repository"
import { BackupService } from "./backup.service"

// 리포지토리 인스턴스 생성
const backupRepository = new BackupRepository()
const backupInfoRepository = new BackupInfoRepository()

// 서비스 인스턴스 생성 및 의존성 주입
export const backupService = new BackupService({
  backupRepository,
  backupInfoRepository,
})
