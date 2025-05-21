//////////////////////////////////////////////
//  Backup Monitoring 필터링 옵션 인터페이스  //
//////////////////////////////////////////////

import { AllRepositoryType } from "../../../types/common/repository"
import { BackupType } from "./backup-common.type"

/**
 * Backup Monitoring 필터링 공통 옵션
 */
export interface BackupMonitoringFilterOptions {
  //  필터 옵션
  mode?: BackupType | ""
  partition?: string
  repositoryType?: AllRepositoryType | ""
  repositoryPath?: string
  //  추가 정보
  detail?: string | boolean
  //  작업 대상 server 이름으로 Monitoring 요청시에만 사용
  serverType?: string
}
