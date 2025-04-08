//////////////////////////////////
//  Backup Service 선언 및 관리  //
//////////////////////////////////

import { serverPartitionService, serverService } from "../../server/services/service-registry"
import { zdmRepositoryService, zdmService } from "../../zdm/services/service-registry"
import { BackupInfoRepository } from "../repositories/backup-info.repository"
import { BackupRepository } from "../repositories/backup.repository"
import { BackupRegistService } from "./backup-regist.service"
import { BackupService } from "./backup.service"

/**
 * 리포지토리 인스턴스 생성
 */
const backupRepository = new BackupRepository()
const backupInfoRepository = new BackupInfoRepository()

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
  backupService,
})
