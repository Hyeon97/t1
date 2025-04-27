//////////////////////////////////////
//  schedule_info table 스키마 정의  //
//////////////////////////////////////

import { ScheduleStatusEnum, ScheduleTypeEnum } from "../schedule-common.type"

export interface ScheduleInfoTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  nScheduleType: ScheduleTypeEnum //  0:한번, 1:매분, 2:매시, 3:매일, 4:매주, 5:매월(특정주), 6:매월(특정일)
  nStatus: ScheduleStatusEnum //  0: 비활성화 1: 활성화
  sYear: string | null
  sMonth: string | null
  sDay: string | null
  nPeriodHour: number
  nPeriodMinute: number
  sTime: string | null
  sDayweek: string | null
  sWeek: string | null
  sDate: string | null
  sMonths: string | null
  sLastRunTime: string | null
  nOffset: number
  sJobName: string | null
  nRun: number
  nFlags: number
}
