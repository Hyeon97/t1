////////////////////////
//  네트워크 정보 DTO  //
////////////////////////

import { ServerNetworkTable } from "../../../types/db/server-network"

export class ServerNetworkInfoDTO {
  name: string
  ipAddress: string
  subNet: string
  gateWay: string
  macAddress: string
  lastUpdated: string

  constructor({ network }: { network: ServerNetworkTable }) {
    this.name = network.sNetworkName
    this.ipAddress = network.sIPAddress || "-"
    this.subNet = network.sSubnet || "-"
    this.gateWay = network.sGateway || "-"
    this.macAddress = network.sMacaddress || "-"
    this.lastUpdated = network.sLastUpdateTime || "Unknown"
  }

  static fromEntity({ network }: { network: ServerNetworkTable }): ServerNetworkInfoDTO {
    return new ServerNetworkInfoDTO({ network })
  }

  static fromEntities({ networks }: { networks: ServerNetworkTable[] }): ServerNetworkInfoDTO[] {
    return networks.map((network) => ServerNetworkInfoDTO.fromEntity({ network }))
  }
}
