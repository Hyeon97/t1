//////////////////////////////
//  Schedule 정보 응답 DTO  //
//////////////////////////////

import { ScheduleInfoTable } from "../../types/db/schedule-info"
import { ScheduleStatusMap, ScheduleStatusType, ScheduleType, ScheduleTypeMap } from "../../types/schedule-common.type"
import { DEFAULT_VALUES_SCHEDULE_RESPONSE, ScheduleDataResponse, ScheduleResponseFields } from "../../types/schedule-response.type"

/**
 * smart schedule ( 7 ~ 11 ) 에서 Basic(full) 스케쥴은 무조건 단일 선택만 가능함
 * 따라서 파싱 함수에서 count가 1인 경우에는 smart schedule의 full로 간주
 */

//  요일 파싱
const parseWeekdayPattern = ({ str }: { str?: string }): { days: string; count: number } => {
  if (!str) return { days: "", count: 0 }

  const weekday = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const selectedDays = str.split('|')
    .map((el, idx) => el === '1' ? weekday[idx] : null)
    .filter(day => day !== null && day !== undefined)

  return {
    days: selectedDays.join(', '),
    count: selectedDays.length
  }
}

//  주 파싱
const parseWeekPattern = ({ str }: { str?: string }): { weeks: string; count: number } => {
  if (!str) return { weeks: "", count: 0 }
  const week = ['First', 'Second', 'Third', 'Fourth', 'Last']
  const selectedWeeks = str.split('|')
    .map((el, idx) => el === '1' ? `${week[idx]} Week` : null)
    .filter(week => week !== null && week !== undefined)

  return {
    weeks: selectedWeeks.join(', '),
    count: selectedWeeks.length
  }
}

//  월 파싱
const parseMonthPattern = ({ str }: { str?: string }): { months: string; count: number } => {
  if (!str) return { months: "", count: 0 }
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const selectedMonths = str.split('|')
    .map((el, idx) => el === '1' ? month[idx] : null)
    .filter(month => month !== null && month !== undefined)

  return {
    months: selectedMonths.join(', '),
    count: selectedMonths.length
  }
}

//  날짜 파싱
const parseDatePattern = ({ str }: { str?: string }): { dates: string; count: number } => {
  if (!str) return { dates: "", count: 0 }
  const selectedDates = str.split('|')
    .map((el, idx) => el === '1' ? idx + 1 : null)
    .filter(date => date !== null && date !== undefined)

  return {
    dates: selectedDates.join(', '),
    count: selectedDates.length
  }
}
/**
 * 스케줄 데이터를 기반으로 사용자 친화적인 스케줄 정보 메시지를 생성합니다.
 */
const processScheduleInfo = ({ scheduleData }: { scheduleData: ScheduleInfoTable }): string => {
  try {
    const time = scheduleData.sTime
    const scheduleType = scheduleData.nScheduleType

    // 스케줄 타입에 따른 메시지 생성 함수 매핑
    const scheduleFormatters: Record<number, () => string> = {
      // 일회성 스케줄 (특정 날짜)
      0: () => `[Basic] Start working on ${scheduleData.sDay}/${scheduleData.sMonth}/${scheduleData.sYear} ${time}.`,

      // 분 단위 주기
      1: () => `[Basic] Start working at ${time} every ${scheduleData.nPeriodMinute} Minute.`,

      // 시간 단위 주기
      2: () => `[Basic] Start working at ${time} every ${scheduleData.nPeriodHour} Hour.`,

      // 매일
      3: () => `[Basic] Start working at ${time} every day.`,

      // 매주 특정 요일
      4: () => {
        const parsedWeekday = parseWeekdayPattern({ str: scheduleData.sDayweek! })
        return `[Basic] Start working at ${time} ${parsedWeekday.days} every week.`
      },

      // 매월 특정 주/요일
      5: () => {
        const parsedWeek = parseWeekPattern({ str: scheduleData.sWeek! })
        const parsedWeekday = parseWeekdayPattern({ str: scheduleData.sDayweek! })
        return `[Basic] Start working at ${time} ${parsedWeek.weeks} / ${parsedWeekday.days} every month.`
      },

      // 매월 특정 날짜
      6: () => {
        const parsedDate = parseDatePattern({ str: scheduleData.sDate! })
        return `[Basic] Start working at ${time} ${parsedDate.dates} every month.`
      },

      // 특정 요일
      7: () => {
        const parsedWeekday = parseWeekdayPattern({ str: scheduleData.sDayweek! })
        const prefix = parsedWeekday.count === 1 ? '[Basic]' : '[Advanced]'
        return `${prefix} Start working every ${parsedWeekday.days}${parsedWeekday.count === 1 ? '' : ` at ${time}`}`
      },

      // 매월 특정 주/요일 (고급)
      8: () => {
        const parsedWeekday = parseWeekdayPattern({ str: scheduleData.sDayweek! })
        const parsedWeek = parseWeekPattern({ str: scheduleData.sWeek! })
        const prefix = parsedWeekday.count === 1 ? '[Basic]' : '[Advanced]'

        return parsedWeekday.count === 1
          ? `${prefix} Start working at ${time} on ${parsedWeekday.days} ${parsedWeek.weeks} of every month.`
          : `${prefix} Start working at ${time} on the ${parsedWeekday.days} of the ${parsedWeek.weeks} of every month.`
      },

      // 매월 특정 날짜 (고급)
      9: () => {
        const parsedDate = parseDatePattern({ str: scheduleData.sDate! })
        const prefix = parsedDate.count === 1 ? '[Basic]' : '[Advanced]'

        return `${prefix} Start working at ${time} on the ${parsedDate.dates} of every month.`
      },

      // 특정 월/주/요일
      10: () => {
        const parsedWeek = parseWeekPattern({ str: scheduleData.sWeek! })
        const parsedWeekday = parseWeekdayPattern({ str: scheduleData.sDayweek! })
        const parsedMonth = parseMonthPattern({ str: scheduleData.sMonths! })
        const prefix = parsedWeek.count === 1 ? '[Basic]' : '[Advanced]'

        return parsedWeek.count === 1
          ? `${prefix} Start working at ${time} on the ${parsedWeek.weeks} ${parsedWeekday.days} of ${parsedMonth.months}`
          : `${prefix} Start working at ${time} on the ${parsedWeek.weeks} / ${parsedWeekday.days} of ${parsedMonth.months}`
      },

      // 특정 월/날짜
      11: () => {
        const parsedMonth = parseMonthPattern({ str: scheduleData.sMonths! })
        const parsedDate = parseDatePattern({ str: scheduleData.sDate! })
        const prefix = parsedMonth.count === 1 ? '[Basic]' : '[Advanced]'

        return parsedMonth.count === 1
          ? `${prefix} Start working on ${parsedMonth.months} ${parsedDate.dates} at ${time}`
          : `${prefix} Start working at ${time} on the ${parsedMonth.months} of ${parsedDate.dates}`
      }
    }

    // 지원되는 스케줄 타입인지 확인
    if (!(scheduleType in scheduleFormatters)) {
      throw new Error(`Unsupported schedule type: ${scheduleType}`)
    }

    // 해당 스케줄 타입에 맞는 메시지 생성 함수 실행
    return scheduleFormatters[scheduleType]()
  } catch (error) {
    // 오류 로깅 추가 (선택적)
    console.error('Error processing schedule info:', error)
    // 에러를 다시 던져서 호출자가 처리할 수 있도록 함
    throw error
  }
}

export class ScheduleResponseDTO implements ScheduleResponseFields {
  id: string
  center: string
  type: ScheduleType | string
  state: ScheduleStatusType | string
  jobName: string
  lastRunTime: string
  description: string

  constructor({
    id = DEFAULT_VALUES_SCHEDULE_RESPONSE.id,
    center = DEFAULT_VALUES_SCHEDULE_RESPONSE.center,
    type = DEFAULT_VALUES_SCHEDULE_RESPONSE.type,
    state = DEFAULT_VALUES_SCHEDULE_RESPONSE.state,
    jobName = DEFAULT_VALUES_SCHEDULE_RESPONSE.jobName,
    lastRunTime = DEFAULT_VALUES_SCHEDULE_RESPONSE.lastRunTime,
    description = DEFAULT_VALUES_SCHEDULE_RESPONSE.description,
  }: Partial<ScheduleResponseFields> = {}) {
    this.id = id
    this.center = center
    this.type = type
    this.state = state
    this.jobName = jobName
    this.lastRunTime = lastRunTime
    this.description = description
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      center: this.center,
      type: this.type,
      state: this.state,
      jobName: this.jobName,
      lastRunTime: this.lastRunTime,
      description: this.description,
    }
  }

  /**
   * 엔티티에서 기본 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ scheduleData }: { scheduleData: ScheduleInfoTable }): ScheduleResponseDTO {
    return new ScheduleResponseDTO({
      id: String(scheduleData.nID),
      center: String(scheduleData.nCenterID) || DEFAULT_VALUES_SCHEDULE_RESPONSE.center, // scheduleData.center,
      type: ScheduleTypeMap.toString({ value: scheduleData.nScheduleType }),
      state: ScheduleStatusMap.toString({ value: scheduleData.nStatus }),
      jobName: scheduleData.sJobName || DEFAULT_VALUES_SCHEDULE_RESPONSE.jobName,
      lastRunTime: scheduleData.sLastRunTime || DEFAULT_VALUES_SCHEDULE_RESPONSE.lastRunTime,
      description: processScheduleInfo({ scheduleData })
    })
  }

  /**
   * 엔티티 배열에서 기본 DTO 배열로 변환
   */
  static fromEntities({ schedules }: { schedules: ScheduleDataResponse | ScheduleInfoTable[] }): ScheduleResponseDTO[] {
    if ("items" in schedules) {
      return schedules.items.map((scheduleData) => ScheduleResponseDTO.fromEntity({ scheduleData }))
    }
    return schedules.map((scheduleData) => ScheduleResponseDTO.fromEntity({ scheduleData }))
  }
}
