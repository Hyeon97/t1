///////////////////////////////////////////////////
//  zdm repository data 조회 공통 필터링 옵션 DTO  //
///////////////////////////////////////////////////

import { Expose } from "class-transformer"
import { IsIn, IsOptional } from "class-validator"
import { OSType } from "../../../../../types/common/os"
import { RepositoryType } from "../../../../../types/common/repository"
import { ZDMSearchType } from "../../../types/zdm-common.type"
import { ZdmRepositoryFilterOptions } from "../../../types/zdm-repository/zdm-repository-filter.type"

export class ZdmRepositoryGetQueryDTO implements ZdmRepositoryFilterOptions {
  //  ZDM id | name
  @IsOptional()
  @IsIn(["name", "id"], { message: 'identifierType는 필수이며 값은 "name" 또는 "id"만 가능합니다' })
  @Expose()
  identifierType?: ZDMSearchType

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
