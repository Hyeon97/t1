///////////////////////
//  암호화 타입 정의  //
///////////////////////

import { VALID_ENCRYPTION_VALUES } from "./const-value"

export type EncryptionType = (typeof VALID_ENCRYPTION_VALUES)[number]
export enum EncryptionEnum {
  USE = 1,
}
//  압축 타입 변환
export const EncryptionTypeMap = {
  // 문자열 → 숫자
  fromString: (str: string): number => {
    const upperStr = str.toUpperCase()
    switch (upperStr) {
      case "USE":
        return 1
      default:
        return 0
    }
  },
  // 숫자 → 문자열
  toString: (value: number): string => {
    switch (value) {
      case EncryptionEnum.USE:
        return "Use"
      default:
        return "Not Use"
    }
  },
}