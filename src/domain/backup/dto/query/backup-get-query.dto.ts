//////////////////////////////////////////
//  Backup data 조회 공통 필터링 옵션 DTO //
//////////////////////////////////////////

import { IsIn, IsOptional, IsString } from "class-validator"
import { JobResult, JobStatus } from "../../../../types/common/job"
import { RepositoryType } from "../../../../types/common/repository"
import { BackupType } from "../../types/backup-common.type"
import { BackupFilterOptions } from "../../types/backup-get.type"

export class BackupGetQueryDTO implements BackupFilterOptions {
  //  필터 옵션
  //  작업 모드
  @IsOptional()
  @IsIn(["full", "inc", "smart"], { message: "mode는 'full', 'inc', 'smart'만 가능합니다" })
  mode?: BackupType

  //  작업 대상 파티션
  @IsOptional()
  partition?: string

  //  작업 상태
  @IsOptional()
  @IsIn(["connect", "disconnect"], { message: "status는 'connect' 또는 'disconnect'만 가능합니다" })
  status?: JobStatus

  //  작업 결과
  @IsOptional()
  @IsIn(["connect", "disconnect"], { message: "result는 'connect' 또는 'disconnect'만 가능합니다" })
  result?: JobResult

  //  작업 사용 repository ID
  @IsOptional()
  repositoryID?: number

  //  작업 사용 repository Type
  @IsOptional()
  @IsIn(["smb", "nfs"], { message: "repositoryType은 'smb', 'nfs'만 가능합니다" })
  repositoryType?: RepositoryType

  //  작업 사용 repository Path
  @IsOptional()
  @IsString()
  repositoryPath?: string

  //  상세 정보
  @IsOptional()
  @IsIn(["true"], { message: "detail은 'true'만 가능합니다" })
  detail?: string
}

//  작업 대상 server 이름으로 조회 요청시 DTO
export class BackupGetByServerNameQueryDTO extends BackupGetQueryDTO {
  //  작업 대상 서버 타입
  @IsString()
  serverType!: string
}
