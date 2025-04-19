import { Router } from "express"
import { backupController, backupDeleteController, backupMonitoringController, backupRegistController } from "../controllers/controller-registry"
import {
  validateBackupGetByJobIdParams,
  validateBackupGetByJobNameParams,
  validateBackupGetByServerNameParams,
  validateBackupDeleteQuery,
  validateBackupGetQuery,
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
    //  전체 목록 조회
    this.router.get("/", validateBackupGetQuery, backupController.getBackups)
    //  작업 ID로 조회
    this.router.get("/id/:jobId", validateBackupGetByJobIdParams, validateBackupGetQuery)
    //  작업 이름으로 조회
    this.router.get("/job-name/:jobName", validateBackupGetByJobNameParams, validateBackupGetQuery)
    //  작업 대상 서버 이름으로 조회
    this.router.get("/server-name/:serverName", validateBackupGetByServerNameParams, validateBackupGetQuery)

    //  Backup 작업 삭제
    this.router.delete("/", validateBackupDeleteQuery, backupDeleteController.delete)
    //  작업 ID로 삭제
    this.router.delete("/id/:jobId")
    //  작업 이름으로 삭제
    this.router.delete("/job-name/:jobName")

    //  Backup 작업 등록
    this.router.post("/", validateBackupRegistBody, backupRegistController.regist)
  }

  //  Backup Monitoring 관련
  private BackupMonitoringRoutes(): void {
    // 작업 ID로 백업 모니터링
    this.router.get("/id/:jobId/monitoring", validateBackupMonitoringByJobIdParams, validateBackupMonitoringQuery)
    // 작업 이름으로 백업 모니터링
    this.router.get(
      "/job-name/:jobName/monitoring",
      validateBackupMonitoringByJobNameParams,
      validateBackupMonitoringQuery,
      backupMonitoringController.monitByJobName
    )
    // 작업 대상 서버 이름으로 백업 모니터링
    this.router.get("/server-name/:serverName/monitoring", validateBackupMonitoringByServerNameParams, validateBackupMonitoringQuery)
  }

  //  Backup History 관련
  private BackupHistoryRoutes(): void {
    // 작업 ID로 백업 히스토리 조회
    this.router.get("/id/:jobId/histories")
    // 작업 이름으로 백업 히스토리 조회
    this.router.get("/job-name/:jobName/histories")
    // 작업 대상 서버 이름으로 백업 히스토리 조회
    this.router.get("/server-name/:serverName/histories")
  }

  //  Backup Log 관련
  private BackupLogRoutes(): void {
    // 작업 ID로 백업 로그 조회
    this.router.get("/id/:jobId/logs")
    // 작업 이름으로 백업 로그 조회
    this.router.get("/job-name/:jobName/logs")
    // 작업 대상 서버 이름으로 백업 로그 조회
    this.router.get("/server-name/:serverName/logs")
  }
}
