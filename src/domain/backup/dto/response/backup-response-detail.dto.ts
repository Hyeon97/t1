////////////////////////////////
//  상세 Backup 정보 응답 DTO  //
////////////////////////////////

import { formatDiskSize } from "../../../../utils/data-convert.util"
import { DEFAULT_VALUES_SERVER_RESPONSE, ServerDataResponse, ServerResponseDetailFields } from "../../../server/types/server-response.type"
import { ServerResponseBaseDTO } from "./backup-response-base.dto"

export class ServerResponseDetailDTO extends ServerResponseBaseDTO implements ServerResponseDetailFields {
  agent: string
  model: string
  manufacturer: string
  cpu: string
  cpuCount: string
  memory: string

  constructor(props: Partial<ServerResponseDetailFields>) {
    super(props) // 기본 속성 초기화

    // 상세 속성 초기화
    this.agent = props.agent || DEFAULT_VALUES_SERVER_RESPONSE.agent
    this.model = props.model || DEFAULT_VALUES_SERVER_RESPONSE.model
    this.manufacturer = props.manufacturer || DEFAULT_VALUES_SERVER_RESPONSE.manufacturer
    this.cpu = props.cpu || DEFAULT_VALUES_SERVER_RESPONSE.cpu
    this.cpuCount = props.cpuCount || DEFAULT_VALUES_SERVER_RESPONSE.cpuCount
    this.memory = props.memory || DEFAULT_VALUES_SERVER_RESPONSE.memory
  }

  /**
   * 메모리 값 포맷팅
   */
  private getFormattedMemory(): string {
    if (!this.memory || this.memory === DEFAULT_VALUES_SERVER_RESPONSE.memory) {
      return this.memory
    }

    try {
      return `${this.memory} (${formatDiskSize({ sizeInBytes: this.memory })})`
    } catch (error) {
      return this.memory
    }
  }

  /**
   * JSON 직렬화를 위한 메서드 (오버라이드)
   */
  toJSON(): Record<string, any> {
    // 기본 JSON을 상속받아 확장
    const json = super.toJSON()

    // 상세 필드 추가
    json.agent = this.agent
    json.model = this.model
    json.manufacturer = this.manufacturer
    json.cpu = this.cpu
    json.cpuCount = this.cpuCount
    json.memory = this.getFormattedMemory() // 포맷팅된 메모리 값 사용

    return json
  }

  /**
   * 엔티티에서 상세 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ serverData }: { serverData: ServerDataResponse }): ServerResponseDetailDTO {
    const { server } = serverData

    // 기본 속성 변환에 필요한 객체를 얻기 위해 베이스 클래스의 fromEntity 활용
    const baseProps = ServerResponseBaseDTO.fromEntity({ serverData })

    return new ServerResponseDetailDTO({
      ...baseProps,
      agent: server.sAgentVersion,
      model: server.sModel,
      manufacturer: server.sManufacturer,
      cpu: server.sCPUName,
      cpuCount: server.sNumberOfProcessors,
      memory: server.sTotalPhysicalMemory,
    })
  }

  /**
   * 엔티티 배열에서 상세 DTO 배열로 변환
   */
  static fromEntities({ serversData }: { serversData: ServerDataResponse[] }): ServerResponseDetailDTO[] {
    return serversData.map((serverData) => ServerResponseDetailDTO.fromEntity({ serverData }))
  }
}
