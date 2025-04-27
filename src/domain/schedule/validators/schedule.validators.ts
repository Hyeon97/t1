import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { ScheduleRegistBodyDTO } from "../dto/body/schedule-rergist-body"
import { ScheduleQueryFilterDTO } from "../dto/query/schedule-query-filter.dto"

// /**
//  * 특정 Schedule 조회 요청 parameter 검증
//  */
// export const validateSpecificScheduleParams = validationMiddleware.validateParams(SpecificScheduleParamDTO)

// /**
//  * 특정 Schedule 조회 요청 queryString 검증
//  */
// export const validateSpecificScheduleQuery = validationMiddleware.validateQuery(SpecificScheduleFilterDTO)

/**
 * 전체 Schedule 조회 요청 queryString 검증
 */
export const validateScheduleListQuery = validationMiddleware.validateQuery(ScheduleQueryFilterDTO)

/**
 * Schedule 등록 요청 body 검증
 */
export const validateScheduleRegistBody = validationMiddleware.validateBody(ScheduleRegistBodyDTO)
