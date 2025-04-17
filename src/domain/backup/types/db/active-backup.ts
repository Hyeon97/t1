//////////////////////////////////////
//  active_backup table 스키마 정의  //
//////////////////////////////////////

export interface BackupActiveTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  sJobName: string
  nJobID: number
  nProcessType: number
  sStep: string
  nPercent: number
  sProcessMsg: string
  sStartTime: string
  sEndTime: string
  sElapsedTime: string
  nFlags: number
  nHistoryID: number
}
