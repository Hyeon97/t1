/////////////////////////////////////
//  zcon_license table 스키마 정의   //
/////////////////////////////////////

export interface ZconLicenseTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  nLicenseCopyNumber: number
  nLicenseUseCopyNumber: number
  sLicenseKey: string
  sLicenseKeySecond: string
  sLicenseExpirationDate: string
  sLicenseCreateDate: string
  nLicenseCategory: number
  sActivationKey: string
  sLicenseName: string
  sDescription: string
  nLicenseReference: number
}