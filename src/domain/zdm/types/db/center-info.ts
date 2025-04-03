////////////////////////////////////
//  center_info table 스키마 정의  //
////////////////////////////////////

import { ZDMActivationEnum, ZDMModeEnum } from "../zdm-common.type"

export interface ZdmInfoTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterInfo: ZDMModeEnum // 1: 보조센터 , 2: 단일주센터, 3: 슈퍼주센터'
  sCenterName: string
  sHostName: string
  sCenterStatus: string
  sCenterVersion: string
  sOSVersion: string
  sIPAddress: string
  sModel: string
  sPrivateIPAddress: string
  sOrganization: string
  sManufacturer: string
  sSystemType: string
  sCPUName: string
  sNumberOfProcessors: string
  sTotalPhysicalMemory: string
  sMachineID: string
  sLastUpdateTime: string
  nFlags: number
  nMain: number
  sInstallID: string
  sActivation: ZDMActivationEnum // Activation 여부 확인(ok/fail)
  nAutoLicense: number
  sKernalVersion: string
  sInstallPath: string
  sLogPath: string
  sDescription: string
}
