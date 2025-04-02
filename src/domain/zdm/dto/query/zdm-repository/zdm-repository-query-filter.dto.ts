///////////////////////////////////////////////////
//  zdm repository data 조회 공통 필터링 옵션 DTO  //
///////////////////////////////////////////////////

import { IsOptional, IsIn } from "class-validator"
import { OSType } from "../../../../../types/common/os"
import { RepositoryType } from "../../../../../types/common/repository"
import { ZDMSearchType } from "../../../types/zdm-common.type"
import { ZdmRepositoryFilterOptions } from "../../../types/zdm-repository/zdm-repository-filter.type"

export class ZdmRepositoryCommonFilterDTO implements ZdmRepositoryFilterOptions {
  //  ZDM id | name
  @IsOptional()
  @IsIn(["name", "id"], { message: 'identifierType는 필수이며 값은 "name" 또는 "id"만 가능합니다' })
  identifierType?: ZDMSearchType

  @IsOptional()
  center?: string | number

  @IsOptional()
  type?: RepositoryType | ""

  @IsOptional()
  os?: OSType | ""

  //  repository sRemotePath
  @IsOptional()
  path?: string
}
