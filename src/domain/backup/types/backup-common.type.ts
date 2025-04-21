/////////////////////////////////
//  backup 공통 사용 type 정의  //
/////////////////////////////////

import { JobType } from "../../../types/common/job"

//  Backup 조회 타입
export type BackupSearchType = "id" | "name" | "serverName"

//  backup 타입 정의
export type BackupType = JobType
export enum BackupTypeEnum {
  FULL = 300,
  UPDATE = 301,
  INC = 302,
  CHANGE = 303,
  SMART = 400,
}
//  backup 타입 변환
export const BackupTypeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "full":
        return BackupTypeEnum.FULL
      case "update":
        return BackupTypeEnum.UPDATE
      case "inc":
        return BackupTypeEnum.INC
      case "change":
        return BackupTypeEnum.CHANGE
      case "smart":
        return BackupTypeEnum.SMART
      default:
        throw new Error(`Unknown Backup type: ${str}`)
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case BackupTypeEnum.FULL:
        return "Full Backup"
      case BackupTypeEnum.UPDATE:
        return "Update Backup"
      case BackupTypeEnum.INC:
        return "Increment Backup"
      case BackupTypeEnum.CHANGE:
        return "Change Backup"
      case BackupTypeEnum.SMART:
        return "Smart Backup"
      default:
        throw new Error(`Unknown Backup type: ${value}`)
    }
  },
}
