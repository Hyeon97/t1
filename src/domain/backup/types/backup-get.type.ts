////////////////////////////////////////
//  Backup 조회 필터링 옵션 인터페이스  //
////////////////////////////////////////

import { JobResult, JobStatusType } from "../../../types/common/job"
import { RepositoryConnectionType } from "../../../types/common/repository"
import { BackupSearchType, BackupType } from "./backup-common.type"

/**
 * Backup data 조회 필터링 옵션 ( job, log, history, monitoring 공통 / 필요한거만 골라서 사용 )
 */
export interface BackupFilterOptions {
  //  식별자
  identifierType?: BackupSearchType | ""
  //  필터 옵션
  mode?: BackupType | ""
  partition?: string
  status?: JobStatusType | ""
  result?: JobResult | ""
  repositoryID?: number | null
  repositoryType?: RepositoryConnectionType | "" //  조회시에는 연결 타입으로, 등록시에는 repository 자체의 타입으로 구분
  repositoryPath?: string
  //  추가 정보
  detail?: string | boolean
  //  작업 대상 server 이름으로 조회 요청시에만 사용
  serverType?: string
}
