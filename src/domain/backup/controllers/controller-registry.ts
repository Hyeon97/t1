/////////////////////////////////////
//  Backup Controller 선언 및 관리  //
/////////////////////////////////////

import {
  backupDeleteService,
  backupEditService,
  backupMonitoringGetService,
  backupRegistService,
  backupGetService,
} from "../services/service-registry"
import { BackupDeleteController } from "./common/backup-delete.controller"
import { BackupGetController } from "./common/backup-get.controller"
import { BackupRegistController } from "./common/backup-regist.controller"
import { BackupEditController } from "./common/backup-update.controller"
import { BackupMonitoringGetController } from "./monitoring/backup.monitoring.get.controller"

/**
 * backup 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  Backup 정보 조회 Controller
export const backupGetController = new BackupGetController({ backupGetService })
//  Backup 정보 등록 Controller
export const backupRegistController = new BackupRegistController({ backupRegistService })
//  Backup 정보 삭제 Controller
export const backupDeleteController = new BackupDeleteController({ backupDeleteService })
//  Backup 정보 수정 Controller
export const backupEditController = new BackupEditController({ backupEditService })
//  Backup 정보 모니터링 Controller
export const backupMonitoringController = new BackupMonitoringGetController({ backupMonitoringGetService })
