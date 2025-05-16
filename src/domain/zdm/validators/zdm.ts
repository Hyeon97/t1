import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { ZdmGetByIdDTO, ZdmGetByNameDTO } from "../dto/param/zdm-get-param.dto"
import { ZdmRepositoryGetQueryDTO } from "../dto/query/zdm-repository/zdm-repository-query-filter.dto"
import { ZdmGetQueryDTO } from "../dto/query/zdm/zdm-query-filter.dto"

/**
 * ZDM 관련
 */
//  ZDM 정보 조회 공통 queryString 검증
export const validateZdmGetQuery = validationMiddleware.validateQuery(ZdmGetQueryDTO)
//  ZDM Name으로 조회 Parameter 검증
export const validateZdmGetByZdmNameParams = validationMiddleware.validateParams(ZdmGetByNameDTO)
//  ZDM ID로 조회 Parameter 검증
export const validateZdmGetByZdmIdParamas = validationMiddleware.validateParams(ZdmGetByIdDTO)

/**
 * ZDM Repository 관련
 */
//  ZDM 레포지토리 정보 등록 queryString 검증
export const validateRepositoryRegistQuery = validationMiddleware.validateQuery(null)
//  전체 레포지토리 조회 queryString 검증 ( ZDM 구분 X )
export const validateRepositoryGetQuery = validationMiddleware.validateQuery(ZdmRepositoryGetQueryDTO)
//  특정 ZDM의 전체 레포지토리 조회 queryString 검증
export const validateZdmRepositoryListQuery = validationMiddleware.validateQuery(null)
//  특정 ZDM의 특정 레포지토리 조회 queryString 검증
export const validateZdmRepositoryQuery = validationMiddleware.validateQuery(null)
//  ZDM의 특정 레포지토리 정보 삭제 queryString 검증
export const validateRepositoryDeleteQuery = validationMiddleware.validateQuery(null)

/**
 * ZDM ZOS Repository 관련
 */
//  ZDM ZOS 레포지토리 정보 등록 queryString 검증
export const validateZOSRepositoryRegistQuery = validationMiddleware.validateQuery(null)
//  전체 ZOS 레포지토리 조회 queryString 검증 ( ZDM 구분 X )
export const validateZOSRepositoryListQuery = validationMiddleware.validateQuery(null)
//  특정 ZDM의 전체 ZOS 레포지토리 조회 queryString 검증
export const validateZdmZOSRepositoryListQuery = validationMiddleware.validateQuery(null)
//  특정 ZDM의 특정 ZOS 레포지토리 조회 queryString 검증
export const validateZdmZOSRepositoryQuery = validationMiddleware.validateQuery(null)
//  ZDM의 특정 ZOS 레포지토리 정보 삭제 queryString 검증
export const validateZOSRepositoryDeleteQuery = validationMiddleware.validateQuery(null)
