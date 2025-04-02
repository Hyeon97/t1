import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { ServerQueryFilterDTO } from "../dto/query/server-query-filter.dto"
import { SpecificServerFilterDTO } from "../dto/query/specific-server-query-filter.dto"
import { SpecificServerParamDTO } from "../dto/query/specific-server-param-filter.dto"

/**
 * 특정 server 조회 요청 parameter 검증
 */
export const validateSpecificServerParams = validationMiddleware.validateParams(SpecificServerParamDTO)

/**
 * 특정 server 조회 요청 queryString 검증
 */
export const validateSpecificServerQuery = validationMiddleware.validateQuery(SpecificServerFilterDTO)

/**
 * 전체 server 조회 요청 queryString 검증
 */
export const validateServerListQuery = validationMiddleware.validateQuery(ServerQueryFilterDTO)
