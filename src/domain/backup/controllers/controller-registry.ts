/////////////////////////////////////
//  Backup Controller 선언 및 관리  //
/////////////////////////////////////

import { backupService } from "../services/service-registry"
import { BackupController } from "./common/backup.get.controller"

/**
 * backup 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  backup 정보 등록
export const backupController = new BackupController({ backupService })
