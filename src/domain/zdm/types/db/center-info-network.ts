////////////////////////////////////////////
//  center_info_network table 스키마 정의  //
////////////////////////////////////////////

export interface ZdmInfoNetworkTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  sNetworkName: string
  sIPAddress: string
  sSubnet: string
  sGateway: string
  sMacaddress: string
  sLastUpdateTime: string
  nFlags: number
}
