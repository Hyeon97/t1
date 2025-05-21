///////////////////////////////////////////////////
//  zdm repository data 조회 공통 필터링 옵션 DTO  //
///////////////////////////////////////////////////

import { Expose } from "class-transformer"
import { IsIn, IsOptional } from "class-validator"
import { NON_SSH_REPOSITORY_VALUES } from "../../../../../types/common/const-value"
import { OSType } from "../../../../../types/common/os"
import { RepositoryTypeNonSSH } from "../../../../../types/common/repository"
import { ZdmRepositoryFilterOptions } from "../../../types/zdm-repository/zdm-repository-filter.type"

export class ZdmRepositoryGetQueryDTO implements ZdmRepositoryFilterOptions {

  @IsOptional()
  @Expose()
  center?: string

  @IsOptional()
  @IsIn(NON_SSH_REPOSITORY_VALUES, {
    message: `type은 ${NON_SSH_REPOSITORY_VALUES.join(", ")}중 하나여야 합니다`,
  })
  @Expose()
  type?: RepositoryTypeNonSSH

  @IsOptional()
  @Expose()
  os?: OSType

  //  repository sRemotePath
  @IsOptional()
  @Expose()
  path?: string
}
