///////////////////////////////////////////
//  ZDM ZOS Repository 정보 조회 응답 정의  //
///////////////////////////////////////////

import { ZdmZosRepositoryTable } from "../db/center-zos-repository"

export interface ZdmZosRepositoryDataResponse {
  items: ZdmZosRepositoryTable[]
}
