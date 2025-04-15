/////////////////////////////////////////
//  Backup 작업 삭제 관련 인터페이스 정의  //
/////////////////////////////////////////


/**
 * Backup data 삭제 옵션
 */
export interface BackupDeleteOptions {
  //  필터 옵션
  jobName?: string  //  삭제할 작업 이름
  id?: number | null// 삭제할 작업 ID
}