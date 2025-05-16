/////////////////////////////
//  기본 ZDM 정보 응답 DTO  //
/////////////////////////////

import { ArrayPropertyName, DEFAULT_VALUES_ZDM_RESPONSE, ZdmDataResponse, ZdmResponseBaseFields } from "../../types/zdm/zdm-response.type"
import { ZdmDiskInfoDTO } from "./disk/zdm.disk.dto"
import { ZdmNetworkInfoDTO } from "./network/zdm.network.dto"
import { ZdmPartitionInfoDTO } from "./partition/zdm.partition.dto"
import { ZdmRepositoryInfoDTO } from "./repository/zdm.repository.dto"
import { ZdmZosRepositoryInfoDTO } from "./zos-repository/zdm.zos-repository.dto"

export class ZdmResponseBaseDTO implements ZdmResponseBaseDTO {
  centerName: string
  hostName: string
  ip: string
  state: string
  activation: string
  disk?: ZdmDiskInfoDTO[]
  network?: ZdmNetworkInfoDTO[]
  partition?: ZdmPartitionInfoDTO[]
  repository?: ZdmRepositoryInfoDTO[]
  zosRepository?: ZdmZosRepositoryInfoDTO[]
  constructor({
    centerName = DEFAULT_VALUES_ZDM_RESPONSE.centerName,
    hostName = DEFAULT_VALUES_ZDM_RESPONSE.hostName,
    ip = DEFAULT_VALUES_ZDM_RESPONSE.ip,
    state = DEFAULT_VALUES_ZDM_RESPONSE.state,
    activation = DEFAULT_VALUES_ZDM_RESPONSE.activation,
    disk = DEFAULT_VALUES_ZDM_RESPONSE.disk,
    network = DEFAULT_VALUES_ZDM_RESPONSE.network,
    partition = DEFAULT_VALUES_ZDM_RESPONSE.partition,
    repository = DEFAULT_VALUES_ZDM_RESPONSE.repository,
    zosRepository = DEFAULT_VALUES_ZDM_RESPONSE.zosRepository,
  }: Partial<ZdmResponseBaseFields> = {}) {
    this.centerName = centerName
    this.hostName = hostName
    this.ip = ip
    this.state = state
    this.activation = activation

    // 비어있지 않은 배열만 포함
    this.assignArrayIfNotEmpty({ propName: "disk", value: disk })
    this.assignArrayIfNotEmpty({ propName: "network", value: network })
    this.assignArrayIfNotEmpty({ propName: "partition", value: partition })
    this.assignArrayIfNotEmpty({ propName: "repository", value: repository })
    this.assignArrayIfNotEmpty({ propName: "zosRepository", value: zosRepository })
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
      centerName: this.centerName,
      hostName: this.hostName,
      ip: this.ip,
      state: this.state,
      activation: this.activation,
    }

    // 비어있지 않은 배열만 JSON 객체에 추가
    this.addToJsonIfNotEmpty({ json, propName: "disk", value: this.disk })
    this.addToJsonIfNotEmpty({ json, propName: "network", value: this.network })
    this.addToJsonIfNotEmpty({ json, propName: "partition", value: this.partition })
    this.addToJsonIfNotEmpty({ json, propName: "repository", value: this.repository })
    this.addToJsonIfNotEmpty({ json, propName: "zosRepository", value: this.zosRepository })

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
  static fromEntity({ zdmData }: { zdmData: ZdmDataResponse }): ZdmResponseBaseDTO {
    const { zdm, disk, network, partition, repository, zosRepository } = zdmData

    return new ZdmResponseBaseDTO({
      centerName: zdm.sCenterName,
      hostName: zdm.sHostName,
      ip: zdm.sIPAddress,
      state: zdm.sCenterStatus,
      activation: zdm.sActivation,
      disk: ZdmResponseBaseDTO.transformEntities({
        entities: disk,
        transformer: (entities) => ZdmDiskInfoDTO.fromEntities({ disks: entities }),
      }),
      network: ZdmResponseBaseDTO.transformEntities({
        entities: network,
        transformer: (entities) => ZdmNetworkInfoDTO.fromEntities({ networks: entities }),
      }),
      partition: ZdmResponseBaseDTO.transformEntities({
        entities: partition,
        transformer: (entities) => ZdmPartitionInfoDTO.fromEntities({ partitions: entities }),
      }),
      repository: ZdmResponseBaseDTO.transformEntities({
        entities: repository,
        transformer: (entities) => ZdmRepositoryInfoDTO.fromEntities({ repositories: entities }),
      }),
      zosRepository: ZdmResponseBaseDTO.transformEntities({
        entities: zosRepository,
        transformer: (entities) => ZdmZosRepositoryInfoDTO.fromEntities({ repositories: entities }),
      }),
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
  static fromEntities({ zdmsData }: { zdmsData: ZdmDataResponse[] }): ZdmResponseBaseDTO[] {
    return zdmsData.map((zdmData) => ZdmResponseBaseDTO.fromEntity({ zdmData }))
  }
}
