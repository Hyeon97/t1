import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { ServerGetByIdDTO, ServerGetByNameDTO } from "../dto/param/server-get-param.dto"
import { ServerGetQueryDTO } from "../dto/query/server-get-query"

/**
 * Server 정보 조회
 */
//  server 정보 조회 공통 queryString 검증
export const validateServerGetQuery = validationMiddleware.validateQuery(ServerGetQueryDTO)
//  server Name으로 조회 Parameter 검증
export const validateServerGetByServerNameParams = validationMiddleware.validateParams(ServerGetByNameDTO)
//  server ID로 조회 Parameter 검증
export const validateServerGetByServerIdParams = validationMiddleware.validateParams(ServerGetByIdDTO)