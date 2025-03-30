/**
 * 서버 관련 모든 스키마를 통합
 */

import { serverBaseSchemas } from "./base"
import { serverDiskSchemas } from "./disk"
import { serverDetailSchemas } from "./detail"
import { serverQuerySchemas } from "./query"
import { serverResponseSchemas } from "./responses"
import { serverNetworkSchemas } from "./network"

export const serverSchemas = {
  ...serverBaseSchemas,
  ...serverDiskSchemas,
  ...serverNetworkSchemas,
  ...serverDetailSchemas,
  ...serverQuerySchemas,
  ...serverResponseSchemas,
}
