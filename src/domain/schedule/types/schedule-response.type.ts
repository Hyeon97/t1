///////////////////////////////////
//  Schedule 조회 응답 type 정의  //
///////////////////////////////////

import { ZdmInfoTable } from "../../zdm/types/db/center-info"
import { ScheduleInfoTable } from "./db/schedule-info"
import { RegularScheduleData, ScheduleStatusType, ScheduleType, SmartScheduleData } from "./schedule-common.type"

/**
 * Schedule data 조회 결과 서비스 리턴 타입
 */
export interface ScheduleDataResponse {
  schedule: ScheduleInfoTable
  center: ZdmInfoTable
}


/**
 * 기본 Schedule 정보 응답 필드 인터페이스
 */
export interface ScheduleGetResponseFields {
  id: string //  Schedule ID
  center: {
    id: string //  Schedule 등록 Center ID
    name: string //  Schedule 등록 Center Name
  }
  type: ScheduleType | string //  Schedule Type
  state: ScheduleStatusType | string //  Schedule 활성화 상태
  jobName: string // Schedule 할당 작업 이름
  lastRunTime: string // ``Schedule 마지막 실행 시간
  description: string // Schedule 설명
}

/**
 * Schedule 정보 조회 응답 기본값 상수 정의
 */
export const DEFAULT_VALUES_SCHEDULE_RESPONSE = {
  id: "-",
  center: {
    id: "-",
    name: "-",
  },
  type: "Unknown",
  state: "Unknown",
  jobName: "-",
  lastRunTime: "-",
  description: "-",
}

/**
 * Schedule 등록 서비스 리턴
 */
export interface ScheduleRegistResponse {
  type: number
  scheduleID: number
  scheduleID_advanced: number
  scheduleData: RegularScheduleData | SmartScheduleData
}

/**
 * Schedule 정보 등록 응답 필드 인터페이스
 */
export interface ScheduleRegistResponseFields {
  type: string
  scheduleID: string
  scheduleID_advanced: string
  description: string[]
}

/**
 * Schedule 정보 등록 응답 기본값 상수 정의
 */
export const DEFAULT_VALUES_SCHEDULE_REGIST_RESPONSE = {
  type: 'Unknown',
  scheduleID: '-',
  scheduleID_advanced: '-',
  description: []
}