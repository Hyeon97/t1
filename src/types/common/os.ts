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
      case "window":
        return OSTypeEnum.WINDOW
      case "lin":
      case "linux":
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
        return "Window"
      case OSTypeEnum.LINUX:
        return "Linux"
      case OSTypeEnum.CLOUD:
        return "Cloud"
      default:
        throw new Error(`Unknown OS type: ${value}`)
    }
  },
  stringToString: ({ str }: { str: string }): string => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "win":
      case "window":
        return "Window"
      case "lin":
      case "linux":
        return "Linux"
      case "cloud":
        return "Cloud"
      default:
        throw new Error(`Unknown OS type: ${str}`)
    }
  }
}
