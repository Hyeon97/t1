/////////////////////////////////////
//  Backup Controller 선언 및 관리  //
/////////////////////////////////////

import { backupRegistService, backupService } from "../services/service-registry"
import { BackupController } from "./common/backup.get.controller"
import { BackupRegistController } from "./common/backup.regist.controller"

/**
 * backup 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  Backup 정보 조회 Controller
export const backupController = new BackupController({ backupService })
//  Backup 정보 등록 Controller
export const backupRegistController = new BackupRegistController({ backupService, backupRegistService })
