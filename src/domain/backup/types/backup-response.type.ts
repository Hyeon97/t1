/////////////////////////////////
//  backup 조회 응답 type 정의  //
/////////////////////////////////

import { JobResult } from "../../../types/common/job"
import { RepositoryType } from "../../../types/common/repository"
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
  result: JobResult | string
  schedule: {
    basic: string //  schedule id
    advanced: string //  schedule id
  }
  repository: {
    id: string
    type: RepositoryType | string
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
export interface BackupDataRegistResponse {

}