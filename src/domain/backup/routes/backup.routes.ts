import { Router } from "express"
import { backupController, backupDeleteController, backupRegistController } from "../controllers/controller-registry"
import {
  validateBackupDeleteQuery,
  validateBackupListQuery,
  validateBackupMonitoringByJobIdParams,
  validateBackupMonitoringByJobNameParams,
  validateBackupMonitoringByServerNameParams,
  validateBackupMonitoringQuery,
  validateBackupRegistBody,
} from "../validators/backup.validators"

export class BackupRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.BackupRoutes()
    this.BackupMonitoringRoutes()
    this.BackupHistoryRoutes()
    this.BackupLogRoutes()
  }

  //  Backup 기본
  private BackupRoutes(): void {
    //  전체 목록 리턴
    this.router.get("/", validateBackupListQuery, backupController.getBackups)
    //  작업 ID로 조회
    this.router.get("/id")
    //  작업 이름으로 조회
    this.router.get("/job-name")
    //  Backup 작업 삭제
    this.router.delete("/", validateBackupDeleteQuery, backupDeleteController.delete)
    //  작업 ID로 삭제
    this.router.delete("/id")
    //  작업 이름으로 삭제
    this.router.delete("/job-name")
    //  Backup 작업 등록
    this.router.post("/", validateBackupRegistBody, backupRegistController.regist)
  }

  //  Backup Monitoring 관련
  private BackupMonitoringRoutes(): void {
    // 작업 ID로 백업 모니터링
    this.router.get("/id/:backupId/monitoring", validateBackupMonitoringByJobIdParams, validateBackupMonitoringQuery)
    // 작업 이름으로 백업 모니터링
    this.router.get("/job-name/:name/monitoring", validateBackupMonitoringByJobNameParams, validateBackupMonitoringQuery)
    // 작업 대상 서버 이름으로 백업 모니터링
    this.router.get("/server-name/:serverName/monitoring", validateBackupMonitoringByServerNameParams, validateBackupMonitoringQuery)
  }

  //  Backup History 관련
  private BackupHistoryRoutes(): void {
    // 작업 ID로 백업 히스토리 조회
    this.router.get("/id/:backupId/histories")
    // 작업 이름으로 백업 히스토리 조회
    this.router.get("/job-name/:name/histories")
    // 작업 대상 서버 이름으로 백업 히스토리 조회
    this.router.get("/server-name/:serverName/histories")
  }

  //  Backup Log 관련
  private BackupLogRoutes(): void {
    // 작업 ID로 백업 로그 조회
    this.router.get("/id/:backupId/logs")
    // 작업 이름으로 백업 로그 조회
    this.router.get("/job-name/:name/logs")
    // 작업 대상 서버 이름으로 백업 로그 조회
    this.router.get("/server-name/:serverName/logs")
  }
}
