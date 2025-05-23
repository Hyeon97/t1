/////////////////////////////////////////////
//  Backup 작업 정보 수정 관련 인터페이스 정의  //
/////////////////////////////////////////////

import { CompressionType } from "../../../types/common/compression"
import { EncryptionType } from "../../../types/common/encryption"
import { JobStatusType } from "../../../types/common/job"
import { RepositoryBody } from "../../../types/common/repository"
import { BackupType } from "./backup-common.type"
import { BackupTable } from "./db/job-backup"
import { BackupInfoTable } from "./db/job-backup-info"

/**
 * Backup 작업 수정 user input
 */
// //  필수 식별자
// jobName?: string //  작업 변경 대상 작업 이름
// jobId?: number //  작업 변경 대상 작업 아이디
export interface BackupEditRequestBody {
  //  변경 데이터
  partition?: string[] // 작업 파티션
  changeName?: string //  변경할 작업 이름
  type?: BackupType //  작업 타입
  status?: JobStatusType
  description?: string //  추가 설명
  rotation?: number //  작업 반복 횟수
  compression?: CompressionType //  작업시 압축 여부
  encryption?: EncryptionType // 작업시 암호화 여부
  excludeDir?: string //  작업 제외 디렉토리
  mailEvent?: string //  작업 이벤트 수신 mail
  networkLimit?: number //  작업 네트워크 제한 속도
  schedule?: {
    full?: string //  숫자만 있는 경우 zdm에 등록된 schedule ID | 그외 : 신규 스케쥴 등록 후 적용
    inc?: string //  숫자만 있는 경우 zdm에 등록된 schedule ID | 그외 : 신규 스케쥴 등록 후 적용
  }
  repository?: RepositoryBody
}

/**
 * job_backup table update 객체
 */
export type BackupTableUpdateInput = Pick<
  BackupTable,
  | "sJobName"
  | "nJobStatus"
  | "nScheduleID"
  | "nScheduleID_advanced"
  | "sJobResult"
  | "sDescription"
  | "sLastUpdateTime"
>

/**
 * job_backup_info table update 객체
 */
export type BackupTableInfoUpdateInput = Pick<
  BackupInfoTable,
  | "sJobName"
  | "nBackupType"
  | "nRotation"
  | "nCompression"
  | "nEncryption"
  | "sExcludeDir"
  | "nEmailEvent"
  | "sComment"
  | "nRepositoryID"
  | "nRepositoryType"
  | "sRepositoryPath"
  | "nNetworkLimit"
>