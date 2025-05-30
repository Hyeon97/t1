//////////////////////////////////////////
//  Backup data 조회 공통 필터링 옵션 DTO //
//////////////////////////////////////////

import { Expose } from "class-transformer"
import { IsIn, IsOptional, IsString } from "class-validator"
import { VALID_JOB_TYPE_VALUES, VALID_SYSTEM_MODE_VALUES } from "../../../../types/common/const-value"
import { JobStatusType } from "../../../../types/common/job"
import { RepositoryTypeNonSSH } from "../../../../types/common/repository"
import { SystemModeType } from "../../../server/types/server-common.type"
import { BackupType } from "../../types/backup-common.type"
import { BackupFilterOptions } from "../../types/backup-get.type"

export class BackupGetQueryDTO implements BackupFilterOptions {
  //  필터 옵션
  //  작업 모드
  @IsOptional()
  @IsIn(VALID_JOB_TYPE_VALUES, { message: `mode는 ${VALID_JOB_TYPE_VALUES.join(', ')}만 가능합니다` })
  @Expose()
  mode?: BackupType

  //  작업 대상 파티션
  @IsOptional()
  @Expose()
  partition?: string

  //  작업 상태
  @IsOptional()
  @IsIn(["connect", "disconnect"], { message: "status는 'connect' 또는 'disconnect'만 가능합니다" })
  @Expose()
  status?: JobStatusType

  //  작업 결과
  @IsOptional()
  @Expose()
  result?: string

  //  작업 사용 repository ID
  @IsOptional()
  @Expose()
  repositoryID?: number

  //  작업 사용 repository Type
  @IsOptional()
  @IsIn(["smb", "nfs"], { message: "repositoryType은 'smb', 'nfs'만 가능합니다" })
  @Expose()
  repositoryType?: RepositoryTypeNonSSH

  //  작업 사용 repository Path
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

//  작업 대상 server 이름으로 조회 요청시 DTO
export class BackupGetByServerNameQueryDTO extends BackupGetQueryDTO {
  //  작업 대상 서버 타입 | 해당 값 없으면 souce, target 구분 x 
  @IsOptional()
  @IsString()
  @IsIn(VALID_SYSTEM_MODE_VALUES, {
    message: `serverType은 ${VALID_SYSTEM_MODE_VALUES.join(", ")}만 가능합니다`
  })
  @Expose()
  serverType!: SystemModeType
}
