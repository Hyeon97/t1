//////////////////////////////////
//  Backup Service 선언 및 관리  //
//////////////////////////////////

import { scheduleVerifiService } from "../../schedule/services/service-registry"
import { serverGetService, serverPartitionService } from "../../server/services/service-registry"
import { zdmGetService, zdmRepositoryGetService } from "../../zdm/services/service-registry"
import { BackupActiveRepository } from "../repositories/backup-active.repository"
import { BackupHistoryRepository } from "../repositories/backup-history.repository"
import { BackupInfoRepository } from "../repositories/backup-info.repository"
import { BackupLogRepository } from "../repositories/backup-log-event.repository"
import { BackupRepository } from "../repositories/backup.repository"
import { BackupDeleteService } from "./common/backup-delete.service"
import { BackupEditService } from "./common/backup-edit.service"
import { BackupGetService } from "./common/backup-get.service"
import { BackupRegistService } from "./common/backup-regist.service"
import { BackupMonitoringGetService } from "./monitoring/backup-monitoring.service"

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
export const backupGetService = new BackupGetService({
  backupRepository,
  backupInfoRepository,
})
//  Backup 정보 등록 Service
export const backupRegistService = new BackupRegistService({
  serverGetService,
  serverPartitionService,
  zdmGetService,
  zdmRepositoryGetService,
  backupRepository,
  backupInfoRepository,
  scheduleVerifiService
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
  zdmGetService,
  zdmRepositoryGetService,
  backupRepository,
  backupInfoRepository,
  backupLogRepository,
  backupHistoryRepository,
})
//  Backup 정보 모니터링 Service
export const backupMonitoringGetService = new BackupMonitoringGetService({
  backupRepository,
  backupInfoRepository,
  backupActiveRepository,
})
