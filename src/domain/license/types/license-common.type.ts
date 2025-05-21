/////////////////////////////////
//  License 공통 사용 type 정의  //
/////////////////////////////////

/**
 * License 타입 정의
 * zdm web에서 보이는 것과 동일
 */
//  License type
export type LicenseType = "ZDM(Backup)" | "ZDM(DR)" | "ZDM(Migration)"
export enum LicenseTypeEnum {
  "ZDM(Backup)" = 1,
  "ZDM(DR)" = 2,
  "ZDM(Migration)" = 3
}
//  타입 변환
export const LicenseTypeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "zdm(backup)":
        return LicenseTypeEnum["ZDM(Backup)"]
      case "zdm(dr)":
        return LicenseTypeEnum["ZDM(DR)"]
      case "zdm(migration)":
        return LicenseTypeEnum["ZDM(Migration)"]
      default:
        return 0 // Unknown으로 처리
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case LicenseTypeEnum["ZDM(Backup)"]:
        return "ZDM(Backup)"
      case LicenseTypeEnum["ZDM(DR)"]:
        return "ZDM(DR)"
      case LicenseTypeEnum["ZDM(Migration)"]:
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