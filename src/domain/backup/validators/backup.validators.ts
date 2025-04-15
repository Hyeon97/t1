import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { BackupRegistBodyDTO } from "../dto/body/backup-regist.dto"
import { SpecificBackupGetParamDTO } from "../dto/param/get-specific-backup-param.dto"
import { BackupDeleteQueryDTO } from "../dto/query/delete-backup-filter.dto"
import { BackupGetQueryDTO } from "../dto/query/get-backup-filter.dto"
import { SpecificBackupGetQueryDTO } from "../dto/query/get-specific-backup-filter.dto"

/**
 * 특정 Backup 조회 요청 parameter 검증
 */
export const validateSpecificBackupParams = validationMiddleware.validateParams(SpecificBackupGetParamDTO)

/**
 * 특정 Backup 조회 요청 queryString 검증
 */
export const validateSpecificBackupQuery = validationMiddleware.validateQuery(SpecificBackupGetQueryDTO)

/**
 * 전체 Backup 조회 요청 queryString 검증
 */
export const validateBackupListQuery = validationMiddleware.validateQuery(BackupGetQueryDTO)

/**
 * Backup 작업 등록 요청 body 검증
 */
export const validateBackupRegistBody = validationMiddleware.validateBody(BackupRegistBodyDTO)

/**
 * Backup 작업 삭제 요청 queryString 검증
 */
export const validateBackupDeleteQuery = validationMiddleware.validateQuery(BackupDeleteQueryDTO)