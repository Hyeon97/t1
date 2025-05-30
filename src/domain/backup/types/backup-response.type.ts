/////////////////////////////////
//  backup 조회 응답 type 정의  //
/////////////////////////////////

import { AllRepositoryType } from "../../../types/common/repository"
import { BackupType } from "./backup-common.type"
import { BackupTable } from "./db/job-backup"
import { BackupInfoTable } from "./db/job-backup-info"

/**
 * 기본 Backup 정보 응답 필드 인터페이스
 */
export interface BackupResponseFields {
  id: string
  jobName: string
  systemName: string
  partition: string
  mode: BackupType | string
  result: string
  schedule: {
    basic: string //  schedule id
    advanced: string //  schedule id
  }
  repository: {
    id: string
    type: AllRepositoryType | string
    path: string
  }
  timestamp: {
    start: string
    end: string
    elapsed: string
  }
  lastUpdate: string
}

/**
 * 상세 Backup 정보 응답 필드 인터페이스
 */
export interface BackupResponseDetailFields extends BackupResponseFields {
  option: {
    rotation: string
    excludeDir: string
    compression: string
    encryption: string
  }
}

/**
 * Backup 정보 조회 리턴 기본값 상수 정의
 */
export const DEFAULT_VALUES_BACKUP_RESPONSE = {
  id: "-",
  jobName: "-",
  systemName: "-",
  partition: "-",
  mode: "Unknown",
  result: "Unknown",
  schedule: {
    basic: "-",
    advanced: "-",
  },
  repository: {
    id: "-",
    type: "Unknown",
    path: "-",
  },
  timestamp: {
    start: "-",
    end: "-",
    elapsed: "-",
  },
  lastUpdate: "-",
  option: {
    rotation: "1",
    excludeDir: "-",
    compression: "Not Use",
    encryption: "Not Use",
  },
}

/**
 * Backup data 조회 결과 서비스 리턴 타입
 */
export interface BackupDataResponse {
  backup: BackupTable
  info: BackupInfoTable
}

/**
 * Backup 작업 등록 결과 서비스 리턴 타입
 */
export interface BackupDataRegistResponse { }

/**
 * Backup 작업 삭제 결과 서비스 리턴 타입
 */
export interface BackupDataDeleteResponse {
  job_name?: string
  job_id?: string
  delete_state: {
    data: string
    log: string
    history: string
  }
}

/**
 * Backup 작업 모니터링 결과 서비스 리턴 타입
 */
export interface BackupDataMonitoringResponse {
  system: {
    name: string  //  Backup 작업 대상 시스템 이름
  },
  job: {
    name: string
    id: string
    backup_type: string // Backup 작업 타입
    drive: string // Backup 작업 대상 드라이브(파티션)
  },
  state: {
    status: string  //  Backup 작업 상태
    percent: string //  Backup 작업 진행률
    result: string  //  Backup 작업 결과
    description: string //  Backup 작업 설명( 에러 발생시 에러 메시지도 포함 )
  },
  time: {
    start: string // Backup 작업 시작 시간
    elapsed: string // Backup 작업 경과 시간
    end: string // Backup 작업 종료 시간
  }
  log: string[]
}

/**
 * Backup 작업 수정 결과 서비스 리턴 타입
 */
export interface BackupDataEditResponse {
  job_name?: string
  job_id?: string
  changedFields: string[]
}