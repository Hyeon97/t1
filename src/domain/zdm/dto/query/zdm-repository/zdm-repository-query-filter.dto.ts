///////////////////////////////////////////////////
//  zdm repository data 조회 공통 필터링 옵션 DTO  //
///////////////////////////////////////////////////

import { Expose } from "class-transformer"
import { IsOptional } from "class-validator"
import { OSType } from "../../../../../types/common/os"
import { RepositoryType } from "../../../../../types/common/repository"
import { ZdmRepositoryFilterOptions } from "../../../types/zdm-repository/zdm-repository-filter.type"

export class ZdmRepositoryGetQueryDTO implements ZdmRepositoryFilterOptions {

  @IsOptional()
  @Expose()
  center?: string

  @IsOptional()
  @Expose()
  type?: RepositoryType | ""

  @IsOptional()
  @Expose()
  os?: OSType | ""

  //  repository sRemotePath
  @IsOptional()
  @Expose()
  path?: string
}
