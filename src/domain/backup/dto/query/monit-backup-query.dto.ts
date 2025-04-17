////////////////////////////////////////////
//  Backup monitoring 공통 필터링 옵션 DTO //
////////////////////////////////////////////

import { IsIn, IsOptional, IsString } from "class-validator"
import { RepositoryType } from "../../../../types/common/repository"
import { BackupType } from "../../types/backup-common.type"
import { BackupMonitoringFilterOptions } from "../../types/backup-monitoring.type"

/**
 * 모니터링 공통
 */
export class BackupMonitoringQueryDTO implements BackupMonitoringFilterOptions {
  //  필터 옵션
  //  작업 모드
  @IsOptional()
  @IsIn(["full", "inc", "smart"], { message: "mode는 'full', 'inc', 'smart'만 가능합니다" })
  mode?: BackupType

  //  작업 대상 파티션
  @IsOptional()
  partition?: string

  //  작업 사용 repository 타입
  @IsOptional()
  @IsIn(["smb", "nfs"], { message: "repositoryType은 'smb', 'nfs'만 가능합니다" })
  repositoryType?: RepositoryType

  //  작업 사용 repository path
  @IsOptional()
  @IsString()
  repositoryPath?: string

  //  작업 대상 서버 타입 ( 작업 대상 server 이름으로 모니터링 요청시에만 사용 )
  @IsOptional()
  @IsString()
  serverType?: string

  //  상세 정보
  @IsOptional()
  @IsIn(["true"], { message: "detail은 'true'만 가능합니다" })
  detail?: string
}
