//////////////////////////////
//  작업 공통 사용 타입 정의  //
//////////////////////////////

import { JOB_STATUS_VALUES, VALID_JOB_AUTOSTART_VALUES, VALID_JOB_TYPE_VALUES } from "./const-value"

/**
 * 작업 공통 타입 정의
 */
//  작업 타입 정의
export type JobType = (typeof VALID_JOB_TYPE_VALUES)[number]

//  작업 자동 시작 여부 정의
export type AutoStartType = (typeof VALID_JOB_AUTOSTART_VALUES)[number]

/**
 * 작업 진행 상태 정의 ( nJobStatus )
 */
export type JobStatusType = (typeof JOB_STATUS_VALUES)[number]
export enum JobStatusEnum {
  UNKNOWN = 0,  //  알 수 없음
  RUNNING = 1, // 실행중
  COMPLETE = 2, //  완료
  START = 3, // 작업 시작
  WAITING = 4, // 작업 실행 대기
  CANCEL = 10, // 작업 취소
  SCHEDULE = 99, // 스케쥴 작업
}
//  작업 진행 상태 변환
export const JobStatusMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "run":
        return JobStatusEnum.RUNNING
      case "complete":
        return JobStatusEnum.COMPLETE
      case "start":
        return JobStatusEnum.START
      case "waiting":
        return JobStatusEnum.WAITING
      case "cancel":
        return JobStatusEnum.CANCEL
      case "schedule":
        return JobStatusEnum.SCHEDULE
      default:
        return JobStatusEnum.UNKNOWN
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case JobStatusEnum.RUNNING:
        return "Running"
      case JobStatusEnum.COMPLETE:
        return "Complete"
      case JobStatusEnum.START:
        return "Start"
      case JobStatusEnum.WAITING:
        return "Waiting"
      case JobStatusEnum.CANCEL:
        return "Cancel"
      case JobStatusEnum.SCHEDULE:
        return "Schedule"
      default:
        return "Unknown"
    }
  },
}

/**
 * 작업 결과 정의 ( sJobResult )
 * 작업 결과는 랜덤문자열이 들어감으로 별도의 타입지정 안함
 */
