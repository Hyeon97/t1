/////////////////////////////
//  상세 ZDM 정보 응답 DTO  //
/////////////////////////////

import { OSTypeMap } from "../../../../types/common/os"
import { formatDiskSize } from "../../../../utils/data-convert.util"
import { DEFAULT_VALUES_ZDM_RESPONSE, ZdmDataResponse, ZdmResponseDetailFields } from "../../types/zdm/zdm-response.type"
import { ZdmResponseBaseDTO } from "./zdm-response-base.dto"

export class ZdmResponseDetailDTO extends ZdmResponseBaseDTO implements ZdmResponseDetailFields {
  centerVersion: string
  osVersion: string
  model: string
  privateIP: string
  organization: string
  manufacturer: string
  sytemType: string
  cpu: string
  cpuCount: string
  memory: string
  machineID: string
  constructor(props: Partial<ZdmResponseDetailFields>) {
    super(props)
    this.centerVersion = props.centerVersion || DEFAULT_VALUES_ZDM_RESPONSE.centerVersion
    this.osVersion = props.osVersion || DEFAULT_VALUES_ZDM_RESPONSE.osVersion
    this.model = props.model || DEFAULT_VALUES_ZDM_RESPONSE.model
    this.privateIP = props.privateIP || DEFAULT_VALUES_ZDM_RESPONSE.privateIP
    this.organization = props.organization || DEFAULT_VALUES_ZDM_RESPONSE.organization
    this.manufacturer = props.manufacturer || DEFAULT_VALUES_ZDM_RESPONSE.manufacturer
    this.sytemType = props.sytemType || DEFAULT_VALUES_ZDM_RESPONSE.sytemType
    this.cpu = props.cpu || DEFAULT_VALUES_ZDM_RESPONSE.cpu
    this.cpuCount = props.cpuCount || DEFAULT_VALUES_ZDM_RESPONSE.cpuCount
    this.memory = props.memory || DEFAULT_VALUES_ZDM_RESPONSE.memory
    this.machineID = props.machineID || DEFAULT_VALUES_ZDM_RESPONSE.machineID
  }

  /**
   * 메모리 값 포맷팅
   */
  private getFormattedMemory(): string {
    if (!this.memory || this.memory === DEFAULT_VALUES_ZDM_RESPONSE.memory) {
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
    json.centerVersion = this.centerVersion
    json.osVersion = this.osVersion
    json.model = this.model
    json.privateIP = this.privateIP
    json.organization = this.organization
    json.manufacturer = this.manufacturer
    json.sytemType = this.sytemType
    json.cpu = this.cpu
    json.cpuCount = this.cpuCount
    json.memory = this.getFormattedMemory()
    json.machineID = this.machineID
    return json
  }

  /**
   * 엔티티에서 상세 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ zdmData }: { zdmData: ZdmDataResponse }): ZdmResponseDetailDTO {
    const { zdm } = zdmData

    // 기본 속성 변환에 필요한 객체를 얻기 위해 베이스 클래스의 fromEntity 활용
    const baseProps = ZdmResponseBaseDTO.fromEntity({ zdmData })

    return new ZdmResponseDetailDTO({
      ...baseProps,
      centerVersion: zdm.sCenterVersion,
      osVersion: zdm.sOSVersion,
      model: zdm.sModel,
      privateIP: zdm.sPrivateIPAddress,
      organization: OSTypeMap.stringToString({ str: zdm.sOrganization }),
      manufacturer: zdm.sManufacturer,
      sytemType: zdm.sSystemType,
      cpu: zdm.sCPUName,
      cpuCount: zdm.sNumberOfProcessors,
      memory: zdm.sTotalPhysicalMemory,
      machineID: zdm.sMachineID,
    })
  }

  /**
   * 엔티티 배열에서 상세 DTO 배열로 변환
   */
  static fromEntities({ zdmsData }: { zdmsData: ZdmDataResponse[] }): ZdmResponseDetailDTO[] {
    return zdmsData.map((zdmData) => ZdmResponseDetailDTO.fromEntity({ zdmData }))
  }
}
