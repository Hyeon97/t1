///////////////////////////////////////
//  history_backup table 스키마 정의  //
///////////////////////////////////////

export interface BackupHistoryTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  sJobName: string
  nJobID: number
  nBackupType: number
  sDrive: string
  sRepositoryPath: string
  sJobResult: string
  sDescription: string
  sStartTime: string
  sEndTime: string
  sElapsedTime: string
  nFlags: number
}