//////////////////////////////////////
//  Backup 등록 관련 인터페이스 정의  //
//////////////////////////////////////

import { RepositoryType } from "../../../types/common/repository"
import { BackupType } from "./backup-common.type"
import { BackupTable } from "./db/job-backup"
import { BackupInfoTable } from "./db/job-backup-info"

/**
 * Backup 작업 등록시 repository 양식
 */
export interface BackupRegistRequestRepository {
  id: number
  type: RepositoryType
  path?: string
}

/**
 * Backup 작업 등록시 main 양식
 */
export interface BackupRegistRequestBody {
  //  필수
  center: number | string //  number: 센터 ID, string: 센터 name
  server: number | string //  number: 작업 서버 ID, string: 작업 서버 name
  type: BackupType //  작업 타입
  partition: string[] // 작업 파티션
  //  작업 사용 레포지토리
  repository: BackupRegistRequestRepository
  //  선택
  jobName?: string //  작업 이름
  user?: string | number //  number: user ID, string: user mail
  schedule?: {
    full?: number //  등록시에는 zdm에 등록된 schedule ID
    inc?: number //  등록시에는 zdm에 등록된 schedule ID
  }
  descroption?: string //  추가 설명
  rotation?: number //  작업 반복 횟수
  compression?: string //  작업시 압축 여부
  encryption?: string // 작업시 암호화 여부
  excludeDir?: string //  작업 제외 디렉토리
  mail_event?: string //  작업 이벤트 수신 mail
  networkLimit?: number //  작업 네트워크 제한 속도
  autoStart?: string //  자동 시작 여부
}

/**
 *  job_backup table input 객체
 */
export type BackupTableInput = Pick<
  BackupTable,
  | "nUserID"
  | "nCenterID"
  | "sSystemName"
  | "sJobName"
  | "nJobID"
  | "nJobStatus"
  | "nScheduleID"
  | "nScheduleID_advanced"
  | "sJobResult"
  | "sDescription"
  | "sStartTime"
  | "sLastUpdateTime"
>

/**
 * job_backup_info table input 객체
 */
export type BackupInfoTableInput = Pick<
  BackupInfoTable,
  | "nUserID"
  | "nCenterID"
  | "sSystemName"
  | "sJobName"
  | "nBackupType"
  | "nRotation"
  | "nCompression"
  | "nEncryption"
  | "sDrive"
  | "sExcludeDir"
  | "nEmailEvent"
  | "sComment"
  | "nRepositoryID"
  | "nRepositoryType"
  | "sRepositoryPath"
  | "nNetworkLimit"
  | "sLastUpdateTime"
>