///////////////////////////////////////////////
//  ZDM Repository 정보 조회 요청 필터링 옵션  //
///////////////////////////////////////////////

import { OSType } from "../../../../types/common/os"
import { RepositoryType } from "../../../../types/common/repository"

export interface ZdmRepositoryFilterOptions {
  center?: string //  레포지토리가 속한 센터 name 또는 id (숫자만 있는경우)
  type?: RepositoryType | ""
  os?: OSType | ""
  path?: string
}
