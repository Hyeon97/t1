///////////////////////////////////
//  ZDM 정보 조회 요청 필터링 옵션 //
///////////////////////////////////

import { ZDMActivationType, ZDMConnectType } from "../zdm-common.type"

export interface ZdmFilterOptions {
  //  필터 옵션
  connection?: ZDMConnectType | ""
  activation?: ZDMActivationType | ""
  //  추가 정보
  network?: string | boolean
  disk?: string | boolean
  partition?: string | boolean
  repository?: string | boolean
  zosRepository?: string | boolean
  //  상세 정보
  detail?: string | boolean
}
