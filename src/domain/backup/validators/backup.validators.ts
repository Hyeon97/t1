import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { BackupQueryFilterDTO } from "../dto/query/backup-query-filter.dto"
import { SpecificBackupFilterDTO } from "../dto/query/specific-backup-filter.dto"
import { SpecificBackupParamDTO } from "../dto/query/specific-backup-param.dto"

/**
 * 특정 Backup 조회 요청 parameter 검증
 */
export const validateSpecificBackupParams = validationMiddleware.validateParams(SpecificBackupParamDTO)

/**
 * 특정 Backup 조회 요청 queryString 검증
 */
export const validateSpecificBackupQuery = validationMiddleware.validateQuery(SpecificBackupFilterDTO)

/**
 * 전체 Backup 조회 요청 queryString 검증
 */
export const validateBackupListQuery = validationMiddleware.validateQuery(BackupQueryFilterDTO)
