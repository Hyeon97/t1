//////////////////////////////////////
//  Backup 등록 관련 인터페이스 정의  //
//////////////////////////////////////

import { CompressionType } from "../../../types/common/compression"
import { EncryptionType } from "../../../types/common/encryption"
import { AutoStartType } from "../../../types/common/job"
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
 * excludeDir,excludePartition > 사용자 입력 타입: string | 내부 사용값 변환시: string[]
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
  compression?: CompressionType //  작업시 압축 여부
  encryption?: EncryptionType // 작업시 암호화 여부
  excludeDir?: string | string[] //  작업 제외 디렉토리 >> 추후 변경 가능 [{partition:"/", excludeDir:"/test1|/test2..."}]
  excludePartition?: string | string[] //  작업 제외 파티션
  mail_event?: string //  작업 이벤트 수신 mail
  networkLimit?: number //  작업 네트워크 제한 속도
  autoStart?: AutoStartType //  자동 시작 여부
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
  | "nID"
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
>
