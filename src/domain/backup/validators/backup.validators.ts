import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { BackupEditBodyDTO } from "../dto/body/backup-edit-body.dto"
import { BackupRegistBodyDTO } from "../dto/body/backup-regist-body.dto"
import { BackupDeleteByJobIdParamDTO, BackupDeleteByJobNameParamDTO } from "../dto/param/backup-delete-param.dto"
import { BackupEditByJobIdParamDTO, BackupEditByJobNameParamDTO, BackupEditByServerNameParamDTO } from "../dto/param/backup-edit-param.dto"
import { BackupGetByJobIdParamDTO, BackupGetByJobNameParamDTO, BackupGetByServerNameParamDTO } from "../dto/param/backup-get-param.dto"
import {
  BackupMonitoringByJobIdParamDTO,
  BackupMonitoringByJobNameParamDTO,
  BackupMonitoringByServerNameParamDTO,
} from "../dto/param/backup-monit-param.dto"
import { BackupGetQueryDTO } from "../dto/query/backup-get-query.dto"
import { BackupMonitoringQueryDTO } from "../dto/query/backup-monit-query.dto"

/**
 * Backup 작업 조회
 */
//  Backup 조회 공통 queryString 검증
export const validateBackupGetQuery = validationMiddleware.validateQuery(BackupGetQueryDTO)
//  작업 ID로 조회 parameter 검증
export const validateBackupGetByJobIdParams = validationMiddleware.validateParams(BackupGetByJobIdParamDTO)
//  작업 이름으로 조회 parameter 검증
export const validateBackupGetByJobNameParams = validationMiddleware.validateParams(BackupGetByJobNameParamDTO)
//  작업 대상 server 이름으로 조회 parameter 검증
export const validateBackupGetByServerNameParams = validationMiddleware.validateParams(BackupGetByServerNameParamDTO)

/**
 * Backup 작업 등록
 */
//  작업 등록 body 검증
export const validateBackupRegistBody = validationMiddleware.validateBody(BackupRegistBodyDTO)

/**
 * Backup 작업 수정
 */
//  작업 ID로 수정 parameter 검증
export const validateBackupEditByJobIdParams = validationMiddleware.validateParams(BackupEditByJobIdParamDTO)
//  작업 이름으로 수정 parameter 검증
export const validateBackupEditByJobNameParams = validationMiddleware.validateParams(BackupEditByJobNameParamDTO)
//  작업 대상 server 이름으로 수정 parameter 검증
export const validateBackupEditByServerNameParams = validationMiddleware.validateParams(BackupEditByServerNameParamDTO)
//  작업 수정 body 검증
export const validateBackupEditBody = validationMiddleware.validateBody(BackupEditBodyDTO)

/**
 * Backup 작업 삭제
 */
//  작업 ID로 삭제 parameter 검증
export const validateBackupDeleteByJobIdParams = validationMiddleware.validateParams(BackupDeleteByJobIdParamDTO)
//  작업 이름으로 삭제 parameter 검증
export const validateBackupDeleteByJobNameParams = validationMiddleware.validateParams(BackupDeleteByJobNameParamDTO)

/**
 * Backup 작업 모니터링
 */
//  모니터링 공통 queryString 검증
export const validateBackupMonitoringQuery = validationMiddleware.validateQuery(BackupMonitoringQueryDTO)
//  작업 이름으로 모니터링 parameter 검증
export const validateBackupMonitoringByJobNameParams = validationMiddleware.validateParams(BackupMonitoringByJobNameParamDTO)
//  작업 ID로 모니터링 parameter 검증
export const validateBackupMonitoringByJobIdParams = validationMiddleware.validateParams(BackupMonitoringByJobIdParamDTO)
//  작업 대상 server 이름으로 모니터링 parameter 검증
export const validateBackupMonitoringByServerNameParams = validationMiddleware.validateParams(BackupMonitoringByServerNameParamDTO)

/**
 * Backup 작업 History 조회
 */
//  Backup History 조회 공통 queryString 검증
export const validateBackupHistoryQuery = validationMiddleware.validateQuery
//  작업 ID로 백업 히스토리 조회 parameter 검증
export const validateBackupHistoryByJobIdParams = validationMiddleware.validateParams
//  작업 이름으로 백업 히스토리 조회 parameter 검증
export const validateBackupHistoryByJobNameParams = validationMiddleware.validateParams
//  작업 대상 서버 이름으로 백업 히스토리 조회 parameter 검증
export const validateBackupHistoryByServerNameParams = validationMiddleware.validateParams

/**
 * Backup 작업 Log 조회
 */
//  Backup Log 조회 공통 queryString 검증
export const validateBackupLogQuery = validationMiddleware.validateQuery
//  작업 ID로 백업 로그 조회 parameter 검증
export const validateBackupLogByJobIdParams = validationMiddleware.validateParams
//  작업 이름으로 백업 로그 조회 parameter 검증
export const validateBackupLogByJobNameParams = validationMiddleware.validateParams
//  작업 대상 서버 이름으로 백업 로그 조회 parameter 검증
export const validateBackupLogByJobNServerParams = validationMiddleware.validateParams
