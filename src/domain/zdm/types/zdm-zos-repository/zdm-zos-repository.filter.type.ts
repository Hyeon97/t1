///////////////////////////////////////////////////
//  ZDM ZOS Repository 정보 조회 요청 필터링 옵션  //
///////////////////////////////////////////////////

import { ZDMSearchType } from "../zdm-common.type"

export interface ZdmZosRepositoryFilterOptions {
  identifierType: ZDMSearchType
  platform: string
}
