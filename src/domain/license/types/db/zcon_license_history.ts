/////////////////////////////////////////////
//  zcon_license_history table 스키마 정의  //
////////////////////////////////////////////

export interface ZconLicenseHistoryTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  nLicenseID: number
  nLicenseType: number
  sSystemName: string
  sUpdateTime: string
  nFlags: number
}