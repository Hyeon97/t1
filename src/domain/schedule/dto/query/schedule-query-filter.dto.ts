//////////////////////////////////////////////
//  Schedule data 조회 공통 필터링 옵션 DTO  //
//////////////////////////////////////////////

import { IsIn, IsOptional } from "class-validator"
import { ScheduleFilterOptions } from "../../types/schedule-filter.type"
import { ScheduleType, ScheduleStatusType } from "../../types/schedule-common.type"
import { VALID_SCHEDULE_ACTIVATION_VALUES, VALID_SCHEDULE_TYPE_VALUES } from "../../../../types/common/const-value"

export class ScheduleQueryFilterDTO implements ScheduleFilterOptions {
  //  필터 옵션
  @IsOptional()
  @IsIn(VALID_SCHEDULE_TYPE_VALUES, { message: `type은 ${VALID_SCHEDULE_TYPE_VALUES} 만 가능합니다` })
  type?: ScheduleType | ""

  @IsOptional()
  @IsIn(VALID_SCHEDULE_ACTIVATION_VALUES, { message: `state은 ${VALID_SCHEDULE_ACTIVATION_VALUES} 만 가능합니다` })
  state?: ScheduleStatusType | ""
}
