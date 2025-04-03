import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { ZdmRepositoryFilterDTO } from "../dto/query/zdm-repository/zdm-repository-query-filter.dto"
import { SpecificZdmParamDTO } from "../dto/query/zdm/specific-zdm-param-filter.dto"
import { ZdmQueryFilterDTO } from "../dto/query/zdm/zdm-query-filter.dto"

/**
 * ZDM 관련
 */
//  ZDM 전체 조회 요청 queryString 검증
export const validateZdmListQuery = validationMiddleware.validateQuery(ZdmQueryFilterDTO)
//  특정 ZDM 조회 요청 param 검증
export const validateSpecificZdmParams = validationMiddleware.validateParams(SpecificZdmParamDTO)
//  특정 ZDM 조회 요청 queryString 검증
export const validateSpecificZdmQuery = validationMiddleware.validateQuery(null)

/**
 * ZDM Repository 관련
 */
//  ZDM 레포지토리 정보 등록 요청 queryString 검증
export const validateRepositoryRegistQuery = validationMiddleware.validateQuery(null)
//  전체 레포지토리 조회 요청 queryString 검증 ( ZDM 구분 X )
export const validateRepositoryListQuery = validationMiddleware.validateQuery(ZdmRepositoryFilterDTO)
//  특정 ZDM의 전체 레포지토리 조회 요청 queryString 검증
export const validateZdmRepositoryListQuery = validationMiddleware.validateQuery(null)
//  특정 ZDM의 특정 레포지토리 조회 요청 queryString 검증
export const validateZdmRepositoryQuery = validationMiddleware.validateQuery(null)
//  ZDM의 특정 레포지토리 정보 삭제 요청 queryString 검증
export const validateRepositoryDeleteQuery = validationMiddleware.validateQuery(null)

/**
 * ZDM ZOS Repository 관련
 */
//  ZDM ZOS 레포지토리 정보 등록 요청 queryString 검증
export const validateZOSRepositoryRegistQuery = validationMiddleware.validateQuery(null)
//  전체 ZOS 레포지토리 조회 요청 queryString 검증 ( ZDM 구분 X )
export const validateZOSRepositoryListQuery = validationMiddleware.validateQuery(null)
//  특정 ZDM의 전체 ZOS 레포지토리 조회 요청 queryString 검증
export const validateZdmZOSRepositoryListQuery = validationMiddleware.validateQuery(null)
//  특정 ZDM의 특정 ZOS 레포지토리 조회 요청 queryString 검증
export const validateZdmZOSRepositoryQuery = validationMiddleware.validateQuery(null)
//  ZDM의 특정 ZOS 레포지토리 정보 삭제 요청 queryString 검증
export const validateZOSRepositoryDeleteQuery = validationMiddleware.validateQuery(null)
