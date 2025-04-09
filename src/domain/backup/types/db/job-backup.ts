///////////////////////////////////
//  job_backup table 스키마 정의  //
///////////////////////////////////

export interface BackupTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  sJobName: string
  nJobID: number
  nJobStatus: number //  작업 진행상태(1:실행중, 2:완료, 3:작업시작(서버), 4:작업실행대기(에이전트), 10:작업취소, 99:스케줄)
  nScheduleID: number
  nScheduleID_advanced: number
  sJobResult: string
  sDescription: string
  sStartTime: string | Date
  sEndTime: string
  sElapsedTime: string
  sLastUpdateTime: string | Date
  nFlags: number
}