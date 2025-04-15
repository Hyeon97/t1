import { Router } from "express"
import { backupController, backupDeleteController, backupRegistController } from "../controllers/controller-registry"
import { validateBackupDeleteQuery, validateBackupListQuery, validateBackupRegistBody } from "../validators/backup.validators"

export class BackupRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.BackupRoutes()
  }

  private BackupRoutes(): void {
    //  전체 목록 리턴
    this.router.get("/", validateBackupListQuery, backupController.getBackups)
    //  특정 조건으로 조회 ( 기준 : Backup name | Backup id )
    // this.router.get("/:identifier", validateSpecificBackupParams, validateSpecificBackupQuery, backupController.getBackup)
    //  특정 조건으로 삭제 ( 기준 : Backup name | Backup id )
    // this.router.delete("/:identifier")
    //  Backup 작업 삭제
    this.router.delete("/", validateBackupDeleteQuery, backupDeleteController.delete)
    //  Backup 작업 등록
    this.router.post("/", validateBackupRegistBody, backupRegistController.regist)
  }
}
