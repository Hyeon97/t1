/////////////////////////////////////
//  server_basic table 스키마 정의  //
/////////////////////////////////////

import { OSTypeEnum } from "../../../../types/common/os"
import { SystemModeEnum } from "../server-common.type"

export interface ServerBasicTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  sSystemNameDisplay: string
  nSystemMode: SystemModeEnum //  시스템 등록 모드(1:source, 2:target, 3:recovery, 10:vsm)
  nCSMType: number //  CSM서버 타입(0:Onpremise, 1:AWS, 2:Azure, 3:OpenStack, 4:CloudStack, 5:VMware, 6:HyperV, 7:KVM)
  sAgentVersion: string
  nOS: OSTypeEnum
  sOSVersion: string
  sIPAddress: string
  sPrivateIPAddress: string
  sModel: string
  sOrganization: string
  sManufacturer: string
  sSystemType: string
  sCPUName: string
  sNumberOfProcessors: string
  sTotalPhysicalMemory: string
  nNetworkID: number
  sKernelVersion: string
  sStatus: string
  sLastUpdateTime: string
  nFlags: number
  sOriginSystemName: string
  nLicenseID: number
}
