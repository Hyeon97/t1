/////////////////////////////////
//  License 공통 사용 type 정의  //
/////////////////////////////////

import { VALID_LICENSE_TYPE_VALUES } from "../../../types/common/const-value"

/**
 * License 타입 정의
 * zdm web에서 보이는 것과 동일
 */
//  License type
export type LicenseType = (typeof VALID_LICENSE_TYPE_VALUES)[number]
export enum LicenseTypeEnum {
  "zdm(backup)" = 1,
  "zdm(dr)" = 2,
  "zdm(migration)" = 3
}
//  타입 변환
export const LicenseTypeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "zdm(backup)":
        return LicenseTypeEnum["zdm(backup)"]
      case "zdm(dr)":
        return LicenseTypeEnum["zdm(dr)"]
      case "zdm(migration)":
        return LicenseTypeEnum["zdm(migration)"]
      default:
        return 0 // Unknown으로 처리
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case LicenseTypeEnum["zdm(backup)"]:
        return "ZDM(Backup)"
      case LicenseTypeEnum["zdm(dr)"]:
        return "ZDM(DR)"
      case LicenseTypeEnum["zdm(migration)"]:
        return "ZDM(Migration)"
      default:
        return "Unknown" // Unknown으로 처리
    }
  }
}
// export const LicenseTypeMap = {
//   fromString: ({ str }: { str: string }): number => {
//     const mapping: Record<string, number> = {
//       "ZDM(Backup)": LicenseTypeEnum["ZDM(Backup)"],
//       "ZDM(DR)": LicenseTypeEnum["ZDM(DR)"],
//       "ZDM(Migration)": LicenseTypeEnum["ZDM(Migration)"]
//     }
//     return mapping[str] || 0 // 일치하는 값이 없으면 0 반환
//   },
//   toString: ({ value }: { value: number }): string => {
//     const mapping: Record<number, string> = {
//       [LicenseTypeEnum["ZDM(Backup)"]]: "ZDM(Backup)",
//       [LicenseTypeEnum["ZDM(DR)"]]: "ZDM(DR)",
//       [LicenseTypeEnum["ZDM(Migration)"]]: "ZDM(Migration)"
//     }
//     return mapping[value] || "Unknown" // 일치하는 값이 없으면 "Unknown" 반환
//   }
// }