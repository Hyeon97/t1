///////////////////////////////////
//  Server Repository type 정의  //
///////////////////////////////////

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
        return "Source Server"
      case ServerRepositoryTypeEnum.TARGET:
        return "Target Server"
      case ServerRepositoryTypeEnum.VSM:
        return "VSM Server"
      case ServerRepositoryTypeEnum.NETWORK:
        return "Network"
      case ServerRepositoryTypeEnum.CLOUD:
        return "Cloud Storage"
      default:
        return "Unknown"
    }
  },
}
