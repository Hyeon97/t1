import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { LicenseAssignBodyDTO } from "../dto/body/license-assign-body.dto"
import { LicenseRegistBodyDTO } from "../dto/body/license-regist-body.dto"
import { LicenseGetQueryDTO } from "../dto/query/license-get-query"

/**
 * License 정보 조회
 */
//  License 조회 공통 queryString 검증
export const validateLicenseGetQuery = validationMiddleware.validateQuery(LicenseGetQueryDTO)
//  License ID로 조회 parameter 검증
export const validateLicenseGetByLicenseIdParams = validationMiddleware.validateParams(null)
//  License Name으로 조회 parameter 검증
export const validateLicenseGetByLicenseNameParams = validationMiddleware.validateParams(null)

/**
 * License 등록
 */
//  License 등록 Body 검증
export const validateLicenseRegistBody = validationMiddleware.validateBody(LicenseRegistBodyDTO)

/**
 * License 할당
 */
//  License 할당 Body 검증
export const validateLicenseAssignBody = validationMiddleware.validateBody(LicenseAssignBodyDTO)

/**
 * License History 조회
 */
//  License History 조회 공통 queryString 검증
export const validateLicenseHistoryGetQuery = validationMiddleware.validateQuery(LicenseGetQueryDTO)
//  License ID로 조회 parameter 검증
export const validateLicenseHistoryGetByLicenseIdParams = validationMiddleware.validateParams(null)
//  License 할당 Server Name으로 조회 parameter 검증
export const validateLicenseHistoryGetByServerNameParams = validationMiddleware.validateParams(null)