//////////////////////////////////////////////
//  특정 Schedule data 조회 필터링 옵션 DTO  //
//////////////////////////////////////////////

import { IsIn } from "class-validator"
import { ScheduleSearchType } from "../../types/schedule-common.type"
import { ScheduleQueryFilterDTO } from "./schedule-query-filter.dto"

export class SpecificScheduleFilterDTO extends ScheduleQueryFilterDTO {
  //  식별자
  @IsIn(["jobName", "id"], { message: 'identifierType는 필수이며 값은 "jobName", "id"만 가능합니다' })
  identifierType!: ScheduleSearchType
}
