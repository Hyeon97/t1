/////////////////////////////////////////
//  log_event_backup table 스키마 정의  //
/////////////////////////////////////////

export interface BackupLogEventTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  nEventType: number
  sEventTime: string
  sSystemName: string
  sJobName: string
  sDescription: string
  nFlags: number
}