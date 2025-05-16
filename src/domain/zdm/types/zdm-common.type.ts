//////////////////////////////
//  ZDM 공통 사용 type 정의  //
//////////////////////////////

import { VALID_CENTER_ACTIVATION_VALUES, VALID_STATE_VALUES } from "../../../types/common/const-value"

/**
 * ZDM 연결 상태 정의
 */
export type ZDMConnectType = (typeof VALID_STATE_VALUES)[number]

/**
 * ZDM 모드 정의
 */
export enum ZDMModeEnum {
  SUB = 1, //  보조 센터
  SINGLE = 2, //  단일 주 센터
  SUPER = 3, //  슈퍼 주 센터
}
export const ZdmModeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "sub":
        return ZDMModeEnum.SUB
      case "single":
        return ZDMModeEnum.SINGLE
      case "super":
        return ZDMModeEnum.SUPER
      default:
        throw new Error(`Unknown ZDM mode: ${str}`)
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case ZDMModeEnum.SUB:
        return "Secondary centers"
      case ZDMModeEnum.SINGLE:
        return "Single primary center"
      case ZDMModeEnum.SUPER:
        return "Super primary center"
      default:
        return "Unknown"
    }
  },
}

/**
 * ZDM 활성화 상태 정의
 */
export type ZDMActivationType = (typeof VALID_CENTER_ACTIVATION_VALUES)[number]
export enum ZDMActivationEnum {
  ACTIVATE = "ok",
  INACTIVATE = "fail",
}
export const ZDMActivationLabels: Record<ZDMActivationType, string> = {
  [ZDMActivationEnum.ACTIVATE]: "Activate",
  [ZDMActivationEnum.INACTIVATE]: "InActivate",
}
