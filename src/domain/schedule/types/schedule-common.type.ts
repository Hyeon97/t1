///////////////////////////////////
//  Schedule 공통 사용 type 정의  //
///////////////////////////////////

import { VALID_SCHEDULE_ACTIVATION_VALUES, VALID_SCHEDULE_TYPE_VALUES } from "../../../types/common/const-value"

/**
 * Schedule 조회 타입
 */
export type ScheduleSearchType = "jobName" | "id"

/**
 * Schedule 활성화 상태 정의
 */
export type ScheduleStatusType = (typeof VALID_SCHEDULE_ACTIVATION_VALUES)[number]
export enum ScheduleStatusEnum {
  DISABLED = 0,
  ENABLED = 1,
}
export const ScheduleStatusMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "disabled":
        return ScheduleStatusEnum.DISABLED
      case "enabled":
        return ScheduleStatusEnum.ENABLED
      default:
        throw new Error(`Unknown Schedule Status: ${str}`)
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case ScheduleStatusEnum.DISABLED:
        return "Disabled"
      case ScheduleStatusEnum.ENABLED:
        return "Enabled"
      default:
        return "Unknown"
    }
  },
}

/**
 * Schedule 타입 정의
 * 0: Once(한번) 1:Every Minute(매분) 2: Hourly(매시), 3: Daily(매일)
 * 4: Weekly(매주) 5: Monthly on Specific Week(매월 특정주) 6: Monthly on Specific Day(매월 특정일)
 */
export type ScheduleType = (typeof VALID_SCHEDULE_TYPE_VALUES)[number]
export enum ScheduleTypeEnum {
  ONCE = 0,
  EVERY_MINUTE = 1,
  HOURLY = 2,
  DAILY = 3,
  WEEKLY = 4,
  MONTHLY_ON_SPECIFIC_WEEK = 5,
  MONTHLY_ON_SPECIFIC_DAY = 6,
}
export const ScheduleTypeMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "once":
        return ScheduleTypeEnum.ONCE
      case "every minute":
        return ScheduleTypeEnum.EVERY_MINUTE
      case "hourly":
        return ScheduleTypeEnum.HOURLY
      case "daily":
        return ScheduleTypeEnum.DAILY
      case "weekly":
        return ScheduleTypeEnum.WEEKLY
      case "monthly on specific week":
        return ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_WEEK
      case "monthly on specific day":
        return ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_DAY
      default:
        throw new Error(`Unknown Schedule type: ${str}`)
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case ScheduleTypeEnum.ONCE:
        return "Once"
      case ScheduleTypeEnum.EVERY_MINUTE:
        return "Every Minute"
      case ScheduleTypeEnum.HOURLY:
        return "Hourly"
      case ScheduleTypeEnum.DAILY:
        return "Daily"
      case ScheduleTypeEnum.WEEKLY:
        return "Weekly"
      case ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_WEEK:
        return "Monthly on Specific Week"
      case ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_DAY:
        return "Monthly on Specific Day"
      default:
        return "Unknown"
    }
  },
}
