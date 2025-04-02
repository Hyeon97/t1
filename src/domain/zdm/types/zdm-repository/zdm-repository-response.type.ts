/////////////////////////////////////////
//  ZDM Repository 정보 조회 응답 정의  //
/////////////////////////////////////////

import { ZdmRepositoryTable } from "../db/center-repository"

export interface ZDMRepositoryDataResponse {
  items: ZdmRepositoryTable[]
}
