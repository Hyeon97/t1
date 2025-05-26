/////////////////////////////////////
//  License History 관련 type 정의  //
/////////////////////////////////////

import { ZconLicenseHistoryTable } from "./db/zcon_license_history"

/**
 * zcon_license_history table input 객체
 */
export type LicenseHistoryTableInput = Pick<
  ZconLicenseHistoryTable,
  | "nUserID"
  | "nCenterID"
  | "nLicenseID"
  | "nLicenseType"
  | "sSystemName"
  | "sUpdateTime"
>
