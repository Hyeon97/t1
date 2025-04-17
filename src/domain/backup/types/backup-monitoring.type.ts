//////////////////////////////////////////////
//  Backup Monitoring 필터링 옵션 인터페이스  //
//////////////////////////////////////////////

import { RepositoryType } from "../../../types/common/repository"
import { BackupType } from "./backup-common.type"

/**
 * Backup Monitoring 필터링 공통 옵션
 */
export interface BackupMonitoringFilterOptions {
  //  필터 옵션
  mode?: BackupType | ""
  partition?: string
  repositoryType?: RepositoryType | ""
  repositoryPath?: string
  //  추가 정보
  detail?: string | boolean
}
