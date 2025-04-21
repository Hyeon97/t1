//////////////////////////////////
//  Backup Service 선언 및 관리  //
//////////////////////////////////

import { serverPartitionService, serverService } from "../../server/services/service-registry"
import { zdmRepositoryService, zdmService } from "../../zdm/services/service-registry"
import { BackupActiveRepository } from "../repositories/backup-active.repository"
import { BackupHistoryRepository } from "../repositories/backup-history.repository"
import { BackupInfoRepository } from "../repositories/backup-info.repository"
import { BackupLogRepository } from "../repositories/backup-log-event.repository"
import { BackupRepository } from "../repositories/backup.repository"
import { BackupDeleteService } from "./backup-delete.service"
import { BackupEditService } from "./backup-edit.service"
import { BackupMonitoringService } from "./backup-monitoring.service"
import { BackupRegistService } from "./backup-regist.service"
import { BackupService } from "./backup.service"

/**
 * 리포지토리 인스턴스 생성
 */
const backupRepository = new BackupRepository()
const backupInfoRepository = new BackupInfoRepository()
const backupLogRepository = new BackupLogRepository()
const backupHistoryRepository = new BackupHistoryRepository()
const backupActiveRepository = new BackupActiveRepository()

/**
 * 서비스 인스턴스 생성 및 의존성 주입
 */
//  Backup 정보 조회 Service
export const backupService = new BackupService({
  backupRepository,
  backupInfoRepository,
})
//  Backup 정보 등록 Service
export const backupRegistService = new BackupRegistService({
  serverService,
  serverPartitionService,
  zdmService,
  zdmRepositoryService,
  backupRepository,
  backupInfoRepository,
})
//  Backup 정보 삭제 Service
export const backupDeleteService = new BackupDeleteService({
  backupRepository,
  backupInfoRepository,
  backupLogRepository,
  backupHistoryRepository,
})
//  Backup 정보 수정 Service
export const backupEditService = new BackupEditService({
  zdmService,
  zdmRepositoryService,
  backupRepository,
  backupInfoRepository,
  backupLogRepository,
  backupHistoryRepository,
})
//  Backup 정보 모니터링 Service
export const backupMonitoringService = new BackupMonitoringService({
  backupRepository,
  backupInfoRepository,
  backupActiveRepository,
})
