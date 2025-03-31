//////////////////////////////
//  작업 공통 사용 타입 정의  //
//////////////////////////////

/**
 * 작업 진행 상태 정의
 */
export enum JobStatus {
  RUNNING = 1, // 실행중
  COMPLETE = 2, //  완료
  START = 3, // 작업 시작
  WAITING = 4, // 작업 실행 대기
  CANCEL = 10, // 작업 취소
  SCHEDULE = 99, // 스케쥴 작업
}

/**
 * 작업 결과 정의
 */
export enum JobResult { }