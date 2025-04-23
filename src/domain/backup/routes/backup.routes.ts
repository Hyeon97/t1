import { Router } from "express"
import {
  backupController,
  backupDeleteController,
  backupEditController,
  backupMonitoringController,
  backupRegistController,
} from "../controllers/controller-registry"
import {
  validateBackupDeleteByJobIdParams,
  validateBackupDeleteByJobNameParams,
  validateBackupEditBody,
  validateBackupEditByJobIdParams,
  validateBackupEditByJobNameParams,
  validateBackupGetByJobIdParams,
  validateBackupGetByJobNameParams,
  validateBackupGetByServerNameParams,
  validateBackupGetQuery,
  validateBackupMonitoringByJobIdParams,
  validateBackupMonitoringByJobNameParams,
  validateBackupMonitoringByServerNameParams,
  validateBackupMonitoringQuery,
  validateBackupRegistBody
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
    //  [Backup 작업 등록]
    this.router.post("/", validateBackupRegistBody, backupRegistController.regist)

    //  [Backup 작업 조회]
    //  전체 목록 조회
    this.router.get("/", validateBackupGetQuery, backupController.getBackups)
    //  작업 ID로 조회
    this.router.get("/job-id/:jobId", validateBackupGetByJobIdParams, validateBackupGetQuery)
    //  작업 이름으로 조회
    this.router.get("/job-name/:jobName", validateBackupGetByJobNameParams, validateBackupGetQuery)
    //  작업 대상 서버 이름으로 조회
    this.router.get("/server-name/:serverName", validateBackupGetByServerNameParams, validateBackupGetQuery)

    //  [Backup 작업 삭제]
    //  작업 ID로 삭제
    this.router.delete("/job-id/:jobId", validateBackupDeleteByJobIdParams, backupDeleteController.deleteByJobId)
    //  작업 이름으로 삭제
    this.router.delete("/job-name/:jobName", validateBackupDeleteByJobNameParams, backupDeleteController.deleteByJobName)

    //  [Backup 작업 수정]
    //  작업 이름으로 수정
    this.router.put("/job-name/:jobName", validateBackupEditByJobNameParams, validateBackupEditBody, backupEditController.editByJobName)
    //  작업 ID로 수정
    this.router.put("/job-id/:jobId", validateBackupEditByJobIdParams, validateBackupEditBody, backupEditController.editByJobId)
  }

  //  Backup Monitoring 관련
  private BackupMonitoringRoutes(): void {
    // 작업 ID로 백업 모니터링
    this.router.get("/job-id/:jobId/monitoring", validateBackupMonitoringByJobIdParams, validateBackupMonitoringQuery)
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
    this.router.get("/job-id/:jobId/histories")
    // 작업 이름으로 백업 히스토리 조회
    this.router.get("/job-name/:jobName/histories")
    // 작업 대상 서버 이름으로 백업 히스토리 조회
    this.router.get("/server-name/:serverName/histories")
  }

  //  Backup Log 관련
  private BackupLogRoutes(): void {
    // 작업 ID로 백업 로그 조회
    this.router.get("/job-id/:jobId/logs")
    // 작업 이름으로 백업 로그 조회
    this.router.get("/job-name/:jobName/logs")
    // 작업 대상 서버 이름으로 백업 로그 조회
    this.router.get("/server-name/:serverName/logs")
  }
}
