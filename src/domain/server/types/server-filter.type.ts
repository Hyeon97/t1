/////////////////////////////////
//  서버 필터링 옵션 인터페이스  //
/////////////////////////////////

import { OSType } from "../../../types/common/os"
import { SystemModeType, SystemConnectType, LicenseAssignType } from "./server-common.type"

export interface ServerFilterOptions {
  identifierType?: "name" | "id"
  mode?: SystemModeType | ""
  os?: OSType | ""
  connection?: SystemConnectType | ""
  license?: LicenseAssignType | ""
  network?: string | boolean
  disk?: string | boolean
  partition?: string | boolean
  repository?: string | boolean
  detail?: string | boolean
}
