////////////////////////////////////////
//  job_backup_info table 스키마 정의  //
////////////////////////////////////////

export interface BackupInfoTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  sJobName: string
  nBackupType: number //  백업타입(300:전체백업, 301:업데이트백업, 302:증가분백업, 303:변경분백업 , 400:스마트스케쥴)
  nRotation: number
  nCompression: number // 압축옵션(0:안함, 1:압축)
  nEncryption: number //  암호화 유무(0:안함, 1:암호화)
  sDrive: string
  sExcludeDir: string //  다중디렉토리일 경우 |로 구분
  sBeforeScript: string
  sAfterScript: string
  nEmailEvent: number //  이메일 전송 유무(0:이메일 전송안함, 다른값은 이메일정보테이블의 nID값),
  sComment: string
  nRepositoryID: number
  nRepositoryType: number //  저장소 연결 타입(0:로컬,1: SMB, 2:NFS, 3:네크워크(ZConverter)
  sRepositoryPath: string
  nReplicate: number // 백업이미지 자동복제 옵션(0:복제 안함, 1:이미지 생성 이후 자동복제)
  nReplicateRepositoryID: number
  sReplicateRepositoryIP: string
  nReplicateRepositoryPort: number
  nAutoRecoveryJobID: number //  자동복구 ID(job_recovery :nJobStatus 2)
  nNetworkLimit: number //  네트워크 제한(0: 제한없음)
  sOSVersion: string
  sLastUpdateTime: string
  nFlags: number
}