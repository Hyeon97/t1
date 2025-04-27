///////////////////////////////////////////
//  Schedule 정보 등록 관련 인터페이스 정의  //
///////////////////////////////////////////

import { ScheduleStatusEnum, ScheduleTypeEnum } from "./schedule-common.type"

/**
 * full, increment 내 interval 양식 정의
 */
export interface ScheduleDetailInterval {
  hour: number
  minute: number
}

/**
 * full, increment 양식 정의
 */
export interface ScheduleDetail {
  year: string
  month: string
  week: string
  day: string
  time: string
  interval: ScheduleDetailInterval
}

/**
 * Schedule 등록 요청 Body 정의
 */
export interface ScheduleRegistRequestBody {
  //  기본 정보
  center: string //  center 이름 or ID
  //  Schedule 관련 정보
  type: ScheduleTypeEnum // 0 ~ 11 까지
  full?: ScheduleDetail
  increment?: ScheduleDetail
}

/**
 * Schedule DB 등록 타입 - Once
 */
export interface ScheduleDBRegistOnce {
  nID: number
  nUserID: number
  nCenterID: number
  nScheduleType: ScheduleTypeEnum
  nStatus: ScheduleStatusEnum
  sYear: string
  sMonth: string
  sDay: string
  sTime: string
  nOffset: number
  sJobName: string
}
