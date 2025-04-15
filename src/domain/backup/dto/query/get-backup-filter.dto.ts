//////////////////////////////////////////
//  Backup data 조회 공통 필터링 옵션 DTO //
//////////////////////////////////////////

import { IsIn, IsOptional } from "class-validator"
import { JobResult, JobStatus } from "../../../../types/common/job"
import { RepositoryType } from "../../../../types/common/repository"
import { BackupType } from "../../types/backup-common.type"
import { BackupFilterOptions } from "../../types/backup-filter.type"

export class BackupGetQueryDTO implements BackupFilterOptions {
  //  필터 옵션
  @IsOptional()
  @IsIn(["full", "inc", "smart"], { message: "mode는 'full', 'inc', 'smart'만 가능합니다" })
  mode?: BackupType
  //  추가 정보
  @IsOptional()
  partition?: string

  @IsOptional()
  @IsIn(["connect", "disconnect"], { message: "status는 'connect' 또는 'disconnect'만 가능합니다" })
  status?: JobStatus

  @IsOptional()
  @IsIn(["connect", "disconnect"], { message: "result는 'connect' 또는 'disconnect'만 가능합니다" })
  result?: JobResult

  @IsOptional()
  repositoryID?: number

  @IsOptional()
  @IsIn(["smb", "nfs"], { message: "repositoryType은 'smb', 'nfs'만 가능합니다" })
  repositoryType?: RepositoryType

  @IsOptional()
  repositoryPath?: string
  //  상세 정보
  @IsOptional()
  @IsIn(["true"], { message: "detail은 'true'만 가능합니다" })
  detail?: string
}