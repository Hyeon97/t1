/////////////////////////////////
//  server 공통 사용 type 정의  //
/////////////////////////////////

import { VALID_LICENSE_VALUES, VALID_STATE_VALUES, VALID_SYSTEM_MODE_VALUES } from "../../../types/common/const-value"

/**
 * 시스템 연결 상태 정의
 */
export type SystemConnectType = (typeof VALID_STATE_VALUES)[number]

/**
 * 시스템 license 할당 상태 정의
 */
export type LicenseAssignType = (typeof VALID_LICENSE_VALUES)[number]

/**
 * 시스템 모드 정의
 */
export type SystemModeType = (typeof VALID_SYSTEM_MODE_VALUES)[number]
export enum SystemModeEnum {
  SOURCE = 1,
  TARGET = 2,
  RECOVERY = 3,
  VSM = 10,
}
export const SystemModeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "source":
        return SystemModeEnum.SOURCE
      case "target":
        return SystemModeEnum.TARGET
      case "recovery":
        return SystemModeEnum.RECOVERY
      case "vsm":
        return SystemModeEnum.VSM
      default:
        throw new Error(`Unknown System mode: ${str}`)
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case SystemModeEnum.SOURCE:
        return "source"
      case SystemModeEnum.TARGET:
        return "target"
      case SystemModeEnum.RECOVERY:
        return "recovery"
      case SystemModeEnum.VSM:
        return "vsm"
      default:
        return "Unknown"
    }
  },
}

/**
 * 시스템 저장소 타입 정의
 */
export enum ServerRepositoryTypeEnum {
  SOURCE = 1,
  TARGET = 2,
  VSM = 10,
  NETWORK = 20,
  CLOUD = 30,
  UNKNOWN = 99,
}
export const ServerRepositoryTypeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "source":
        return ServerRepositoryTypeEnum.SOURCE
      case "target":
        return ServerRepositoryTypeEnum.TARGET
      case "vsm":
        return ServerRepositoryTypeEnum.VSM
      case "network":
        return ServerRepositoryTypeEnum.NETWORK
      case "cloud storage":
        return ServerRepositoryTypeEnum.CLOUD
      default:
        return ServerRepositoryTypeEnum.UNKNOWN
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case ServerRepositoryTypeEnum.SOURCE:
        return "source"
      case ServerRepositoryTypeEnum.TARGET:
        return "target"
      case ServerRepositoryTypeEnum.VSM:
        return "vsm"
      case ServerRepositoryTypeEnum.NETWORK:
        return "network"
      case ServerRepositoryTypeEnum.CLOUD:
        return "cloud storage"
      default:
        return "Unknown"
    }
  },
}
