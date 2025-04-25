///////////////////////////////////////////
//  Schedule 정보 등록 관련 인터페이스 정의  //
///////////////////////////////////////////

/**
 * full, increment 양식 정의
 */
export interface ScheduleDetail {
  year: string
  month: string
  week: string
  day: string
  time: string
  interval: {
    minute: string
    hour: string
  }
}

/**
 * Schedule 등록 요청 Body 정의
 */
export interface ScheduleRegistRequestBody {
  //  기본 정보
  center: string //  center 이름 or ID
  //  Schedule 관련 정보
  type: string
  full?: ScheduleDetail
  increment?: ScheduleDetail
}