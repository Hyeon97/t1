///////////////////////////////////////////////
//  ZDM Repository 정보 조회 요청 필터링 옵션  //
///////////////////////////////////////////////

import { OSType } from "../../../../types/common/os"
import { RepositoryType } from "../../../../types/common/repository"
import { ZDMSearchType } from "../zdm-common.type"

export interface ZdmRepositoryFilterOptions {
  identifierType?: ZDMSearchType
  center?: string | number //  레포지토리가 속한 센터 name 또는 id
  type?: RepositoryType | ""
  os?: OSType | ""
  path?: string
}
