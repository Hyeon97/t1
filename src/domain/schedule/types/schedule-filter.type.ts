///////////////////////////////////////////////
//  Schedule 정보 조회 필터링 옵션 인터페이스  //
//////////////////////////////////////////////

import { ScheduleType, ScheduleStatusType, ScheduleSearchType } from "./schedule-common.type"

//  Schedule data 조회 필터링 옵션 타입
export interface ScheduleFilterOptions {
  //  식별자
  identifierType?: ScheduleSearchType | ""
  //  필터 옵션
  type?: ScheduleType | ""
  state?: ScheduleStatusType | ""
}
