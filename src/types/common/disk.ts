///////////////////////
//  디스크 타입 정의  //
///////////////////////

export enum DiskTypeEnum {
  BIOS = 0,
  GPT = 1,
}
export const DiskTypeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "bios":
        return DiskTypeEnum.BIOS
      case "gpt":
        return DiskTypeEnum.GPT
      default:
        throw new Error(`Unknown Disk type: ${str}`)
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case DiskTypeEnum.BIOS:
        return "Bios"
      case DiskTypeEnum.GPT:
        return "Gpt"
      default:
        return `Unknown Disk type: ${value}`
    }
  },
}
