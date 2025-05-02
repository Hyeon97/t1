///////////////////////////////////////////
//  Schedule 정보 등록 관련 인터페이스 정의  //
///////////////////////////////////////////

import { ScheduleInfoTable } from "./db/schedule-info"
import { ScheduleTypeEnum } from "./schedule-common.type"

/**
 * full, increment 내 interval 양식 정의
 */
export interface ScheduleDetailInterval {
  hour: string
  minute: string
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
  user?: string  //  schedule 등록 user ID or Mail
  jobName?: string  //  스케쥴 할당할 작업 이름
  //  Schedule 관련 정보
  type: ScheduleTypeEnum // 0 ~ 11 까지
  full?: ScheduleDetail
  increment?: ScheduleDetail
}

/**
 * Schedule 검증 요청 객체 정의
 */
export interface ScheduleVerifiInput {
  full?: ScheduleDetail
  increment?: ScheduleDetail
}

/**
 * Schedule DB 등록 타입 - 공통
 */
export type CommonScheduleData = Pick<
  ScheduleInfoTable,
  "nID" |
  "nUserID" |
  "nCenterID" |
  "nScheduleType" |
  "nStatus" |
  "sTime" |
  "nOffset" |
  "sJobName">

/**
 * Schedule DB 등록 타입 - Once
 */
export type OnceScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sYear" | "sMonth" | "sDay">

/**
 * Schedule DB 등록 타입 - Every Minute
 */
export type EveryMinuteScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, 'nPeriodMinute'>

/**
 * Schedule DB 등록 타입 - Hourly
 */
export type HourlyScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, 'nPeriodHour'>

/**
 * Schedule DB 등록 타입 - Daily
 */
export type DailyScheduleData = CommonScheduleData

/**
 * Schedule DB 등록 타입 - Weekly
 */
export type WeeklyScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sDayweek">

/**
 * Schedule DB 등록 타입 - Monthly on Specific Week
 */
export type MonthlyByWeekScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sDayweek" | "sWeek">

/**
 * Schedule DB 등록 타입 - Monthly on Specific Day
 */
export type MonthlyByDayScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sDate">

/**
 * Schedule DB 등록 타입 - Smart Weekly on Specific Day
 */
export type SmartWeeklyByWeekdayScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sDayweek">

/**
 * Schedule DB 등록 타입 - Smart Monthly on Specific Week and Day
 */
export type SmartMonthlyByWeekAndWeekdayScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sDayweek" | "sWeek">

/**
 * Schedule DB 등록 타입 - Smart Monthly on Specific Date
 */
export type SmartMonthlyByDateScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sDate">

/**
 * Schedule DB 등록 타입 - Smart Custom Monthly on Specific Month, Week and Day
 */
export type SmartCustomMonthlyByWeekAndDayScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sDayweek" | "sWeek" | "sMonths">

/**
 * Schedule DB 등록 타입 - Smart Custom Monthly on Specific Month and Date
 */
export type SmartCustomMonthlyByDateScheduleData = CommonScheduleData & Pick<ScheduleInfoTable, "sDate" | "sMonths">
