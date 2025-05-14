////////////////////////////////
//  기본 Server 정보 응답 DTO  //
////////////////////////////////

import { OSTypeMap } from "../../../../types/common/os"
import { SystemModeMap } from "../../types/server-common.type"
import { ArrayPropertyName, DEFAULT_VALUES_SERVER_RESPONSE, ServerDataResponse, ServerResponseBaseFields } from "../../types/server-response.type"
import { ServerNetworkInfoDTO } from "../network/server.network.dto"
import { ServerDiskInfoDTO } from "./disk/server.disk.dto"
import { ServerPartitionInfoDTO } from "./partition/server.partition.dto"

export class ServerResponseBaseDTO implements ServerResponseBaseFields {
  id: string
  systemName: string
  systemMode: string
  os: string
  version: string
  ip: string
  status: string
  licenseID: string | number
  lastUpdated: string
  disk?: ServerDiskInfoDTO[]
  network?: ServerNetworkInfoDTO[]
  partition?: ServerPartitionInfoDTO[]
  repository?: any[]

  constructor({
    id = DEFAULT_VALUES_SERVER_RESPONSE.id,
    systemName = DEFAULT_VALUES_SERVER_RESPONSE.systemName,
    systemMode = DEFAULT_VALUES_SERVER_RESPONSE.systemMode,
    os = DEFAULT_VALUES_SERVER_RESPONSE.os,
    version = DEFAULT_VALUES_SERVER_RESPONSE.version,
    ip = DEFAULT_VALUES_SERVER_RESPONSE.ip,
    status = DEFAULT_VALUES_SERVER_RESPONSE.status,
    licenseID = DEFAULT_VALUES_SERVER_RESPONSE.licenseID,
    lastUpdated = DEFAULT_VALUES_SERVER_RESPONSE.lastUpdated,
    disk = DEFAULT_VALUES_SERVER_RESPONSE.disk,
    network = DEFAULT_VALUES_SERVER_RESPONSE.network,
    partition = DEFAULT_VALUES_SERVER_RESPONSE.partition,
    repository = DEFAULT_VALUES_SERVER_RESPONSE.repository,
  }: Partial<ServerResponseBaseFields> = {}) {
    this.id = id
    this.systemName = systemName
    this.systemMode = systemMode
    this.os = os
    this.version = version
    this.ip = ip
    this.status = status
    this.licenseID = licenseID
    this.lastUpdated = lastUpdated

    // 비어있지 않은 배열만 포함
    this.assignArrayIfNotEmpty({ propName: "disk", value: disk })
    this.assignArrayIfNotEmpty({ propName: "network", value: network })
    this.assignArrayIfNotEmpty({ propName: "partition", value: partition })
    this.assignArrayIfNotEmpty({ propName: "repository", value: repository })
  }

  /**
   * 배열이 비어있지 않은 경우에만 속성 할당
   */
  protected assignArrayIfNotEmpty<T>({ propName, value }: { propName: ArrayPropertyName; value?: T[] }): void {
    if (value && value.length > 0) {
      // 타입 안전성 향상을 위해 명시적인 타입 가드 사용
      this[propName] = value as any
    }
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      id: this.id,
      systemName: this.systemName,
      systemMode: this.systemMode,
      os: this.os,
      version: this.version,
      ip: this.ip,
      status: this.status,
      licenseID: this.licenseID,
      lastUpdated: this.lastUpdated,
    }

    // 비어있지 않은 배열만 JSON 객체에 추가
    this.addToJsonIfNotEmpty({ json, propName: "disk", value: this.disk })
    this.addToJsonIfNotEmpty({ json, propName: "network", value: this.network })
    this.addToJsonIfNotEmpty({ json, propName: "partition", value: this.partition })
    this.addToJsonIfNotEmpty({ json, propName: "repository", value: this.repository })

    return json
  }

  /**
   * 배열이 비어있지 않은 경우에만 JSON에 추가
   */
  protected addToJsonIfNotEmpty<T>({ json, propName, value }: { json: Record<string, any>; propName: ArrayPropertyName; value?: T[] }): void {
    if (value && value.length > 0) {
      json[propName] = value
    }
  }

  /**
   * 엔티티에서 기본 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ serverData }: { serverData: ServerDataResponse }): ServerResponseBaseDTO {
    const { server, disk, network, partition, repository } = serverData

    return new ServerResponseBaseDTO({
      id: String(server.nID),
      systemName: server.sSystemName,
      systemMode: SystemModeMap.toString({ value: server.nSystemMode }),
      os: OSTypeMap.toString({ value: server.nOS }),
      version: server.sOSVersion,
      ip: server.sIPAddress,
      status: server.sStatus,
      licenseID: server.nLicenseID === 0 ? DEFAULT_VALUES_SERVER_RESPONSE.licenseID : server.nLicenseID,
      lastUpdated: server.sLastUpdateTime,
      disk: ServerResponseBaseDTO.transformEntities({
        entities: disk,
        transformer: (entities) => ServerDiskInfoDTO.fromEntities({ disks: entities }),
      }),
      network: ServerResponseBaseDTO.transformEntities({
        entities: network,
        transformer: (entities) => ServerNetworkInfoDTO.fromEntities({ networks: entities }),
      }),
      partition: ServerResponseBaseDTO.transformEntities({
        entities: partition,
        transformer: (entities) => ServerPartitionInfoDTO.fromEntities({ partitions: entities }),
      }),
      repository: repository && repository.length > 0 ? repository : undefined,
    })
  }

  /**
   * 엔티티 배열 변환 헬퍼 메서드
   */
  protected static transformEntities<T, R>({ entities, transformer }: { entities?: T[]; transformer: (entities: T[]) => R[] }): R[] | undefined {
    return entities && entities.length > 0 ? transformer(entities) : undefined
  }

  /**
   * 엔티티 배열에서 기본 DTO 배열로 변환
   */
  static fromEntities({ serversData }: { serversData: ServerDataResponse[] }): ServerResponseBaseDTO[] {
    return serversData.map((serverData) => ServerResponseBaseDTO.fromEntity({ serverData }))
  }
}
