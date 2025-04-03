// import { Router } from "express"
// import { backupController } from "../controllers/controller-registry"
// import { validateSpecificBackupParams, validateSpecificBackupQuery } from "../validators/backup.validators"

// export class BackupRoutes {
//   public router: Router

//   constructor() {
//     this.router = Router()
//     this.BackupRoutes()
//   }

//   private BackupRoutes(): void {
//     //  전체 목록 리턴
//     // this.router.get("/", validateBackupQuery, backupController.getBackups)
//     //  특정 조건으로 조회 ( 기준 : Backup name | Backup id )
//     this.router.get("/:identifier", validateSpecificBackupParams, validateSpecificBackupQuery, backupController.getBackup)
//     //  특정 조건으로 삭제 ( 기준 : Backup name | Backup id )
//     this.router.delete("/:identifier")
//   }
// }
