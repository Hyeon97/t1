///////////////////
//  OS 타입 정의  //
///////////////////

import { VALID_OS_VALUES } from "./const-value"

export type OSType = (typeof VALID_OS_VALUES)[number]
export enum OSTypeEnum {
  WINDOW = 1,
  LINUX = 2,
  CLOUD = 3,
}
export const OSTypeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "win":
        return OSTypeEnum.WINDOW
      case "lin":
        return OSTypeEnum.LINUX
      case "cloud":
        return OSTypeEnum.CLOUD
      default:
        throw new Error(`Unknown OS type: ${str}`)
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case OSTypeEnum.WINDOW:
        return "win"
      case OSTypeEnum.LINUX:
        return "lin"
      case OSTypeEnum.CLOUD:
        return "cloud"
      default:
        throw new Error(`Unknown OS type: ${value}`)
    }
  },
}
