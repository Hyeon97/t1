////////////////////////////////////////////
//  Backup monitoring 공통 필터링 옵션 DTO //
////////////////////////////////////////////

import { Expose } from "class-transformer"
import { IsIn, IsOptional, IsString } from "class-validator"
import { RepositoryTypeNonSSH } from "../../../../types/common/repository"
import { BackupType } from "../../types/backup-common.type"
import { BackupMonitoringFilterOptions } from "../../types/backup-monitoring.type"

export class BackupMonitoringQueryDTO implements BackupMonitoringFilterOptions {
  //  필터 옵션
  //  작업 모드
  @IsOptional()
  @IsIn(["full", "inc", "smart"], { message: "mode는 'full', 'inc', 'smart'만 가능합니다" })
  @Expose()
  mode?: BackupType

  //  작업 대상 파티션
  @IsOptional()
  @Expose()
  partition?: string

  //  작업 사용 repository 타입
  @IsOptional()
  @IsIn(["smb", "nfs"], { message: "repositoryType은 'smb', 'nfs'만 가능합니다" })
  @Expose()
  repositoryType?: RepositoryTypeNonSSH

  //  작업 사용 repository path
  @IsOptional()
  @IsString()
  @Expose()
  repositoryPath?: string

  //  상세 정보
  @IsOptional()
  @IsIn(["true", "false"], { message: "detail은 'true','false'만 가능합니다" })
  @Expose()
  detail?: string
}
