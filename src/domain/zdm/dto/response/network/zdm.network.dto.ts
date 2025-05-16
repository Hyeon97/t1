////////////////////////////
//  ZDM 네트워크 정보 DTO  //
////////////////////////////

import { ZdmInfoNetworkTable } from "../../../types/db/center-info-network"

export class ZdmNetworkInfoDTO {
  name: string
  ipAddress: string
  subNet: string
  gateWay: string
  macAddress: string
  lastUpdated: string

  constructor({ network }: { network: ZdmInfoNetworkTable }) {
    this.name = network.sNetworkName
    this.ipAddress = network.sIPAddress || "-"
    this.subNet = network.sSubnet || "-"
    this.gateWay = network.sGateway || "-"
    this.macAddress = network.sMacaddress || "-"
    this.lastUpdated = network.sLastUpdateTime || "Unknwon"
  }

  static fromEntity({ network }: { network: ZdmInfoNetworkTable }): ZdmNetworkInfoDTO {
    return new ZdmNetworkInfoDTO({ network })
  }

  static fromEntities({ networks }: { networks: ZdmInfoNetworkTable[] }): ZdmNetworkInfoDTO[] {
    return networks.map((network) => ZdmNetworkInfoDTO.fromEntity({ network }))
  }
}
