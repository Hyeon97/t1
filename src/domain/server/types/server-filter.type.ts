///////////////////////////////////
//  Server 필터링 옵션 인터페이스  //
///////////////////////////////////

import { OSType } from "../../../types/common/os"
import { LicenseAssignType, SystemConnectType, SystemModeType } from "./server-common.type"

export interface ServerFilterOptions {
  //  식별자
  identifierType?: "name" | "id"
  //  필터 옵션
  mode?: SystemModeType | ""
  os?: OSType | ""
  connection?: SystemConnectType | ""
  license?: LicenseAssignType | ""
  network?: string | boolean
  disk?: string | boolean
  partition?: string | boolean
  repository?: string | boolean
  //  추가정보
  detail?: string | boolean
}
