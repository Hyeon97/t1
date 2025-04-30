import { ServiceError } from "../../../errors"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { DateTimeUtils } from "../../../utils/Dayjs.utils"
import { reg4NumberOnly, regCommaSeparator, regNumberOnly, regNumbersWithComma, regScheduleTimeInput, regWeekdaysWithComma } from "../../../utils/regex.utils"
import { ScheduleTypeEnum } from "../types/schedule-common.type"
import { DailyScheduleData, EveryMinuteScheduleData, HourlyScheduleData, MonthlyByDayScheduleData, MonthlyByWeekScheduleData, OnceScheduleData, ScheduleDetail, ScheduleVerifiInput, SmartCustomMonthlyByDateScheduleData, SmartCustomMonthlyByWeekAndDayScheduleData, SmartMonthlyByDateScheduleData, SmartMonthlyByWeekAndWeekdayScheduleData, SmartWeeklyByWeekdayScheduleData, WeeklyScheduleData } from "../types/schedule-regist.type"

export class ScheduleVerifiService extends BaseService {
  constructor() {
    super({
      serviceName: "ScheduleVerifiService",
    })
  }

  /**
   * Schedule 검증 - Main
   */
  validateSchedule({ scheduleData, type }: { scheduleData: ScheduleVerifiInput; type: ScheduleTypeEnum }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "validateSchedule", state: "start" })

      // 기본 검증 - 스케줄 데이터 유효성 확인
      this.validateScheduleConstraints({ scheduleData, type })

      // 타입에 따른 데이터 추출
      const { data, mode } = this.extractScheduleData({ scheduleData, type })

      // 타입별 검증 분기
      let result = null
      switch (type) {
        case ScheduleTypeEnum.ONCE:// 0
          result = this.validateOnce({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.EVERY_MINUTE:// 1
          result = this.validateEveryMinute({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.HOURLY:// 2
          result = this.validateHourly({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.DAILY://  3
          result = this.validateDaily({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.WEEKLY:// 4
          result = this.validateWeekly({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_WEEK:// 5
          result = this.validateMonthlyByWeek({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_DAY://  6
          result = this.validateMonthlyByDay({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY:// 7
          result = this.validateSmartWeeklyByWeekday({ data: data as Required<ScheduleVerifiInput> })
          break
        case ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_WEEK_AND_DAY:// 8
          result = this.validateSmartMonthlyByWeekAndWeekday({ data: data as Required<ScheduleVerifiInput> })
          break
        case ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_DATE:// 9
          result = this.validateSmartMonthlyByDate({ data: data as Required<ScheduleVerifiInput> })
          break
        case ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_WEEK_AND_DAY://  10
          result = this.validateSmartCustomMonthlyByWeekAndDay({ data: data as Required<ScheduleVerifiInput> })
          break
        case ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_DATE://  11
          result = this.validateSmartCustomMonthlyByDate({ data: data as Required<ScheduleVerifiInput> })
          break
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "validateSchedule", state: "end" })
      let processedData: any = result
      if (0 <= type && type <= 6) {
        if (mode === 'full') { processedData = { full: result } }
        else if (mode === 'increment') { processedData = { increment: result } }
      }
      return { processedData, scheduleMode: mode }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "validateSchedule",
        message: "[Schedule 정보 검증] - Schedule data 검증 중 오류 발생",
      })
    }
  }

  /**
   * 스케줄 데이터 제약 조건 검증
   */
  private validateScheduleConstraints({ scheduleData, type }: { scheduleData: ScheduleVerifiInput; type: ScheduleTypeEnum }): void {
    // 일반 스케줄 타입 (타입 <= 6)인 경우 full 또는 increment 하나 이상 필요
    if (type <= 6 && !scheduleData?.full && !scheduleData?.increment) {
      throw ServiceError.badRequest(ServiceError, {
        method: "validateScheduleConstraints",
        message: "[Schedule 정보 검증] - Schedule data 에러. full 또는 increment 중 하나 이상 존재 해야함.",
        metadata: {}
      })
    }

    // 스마트 스케줄 타입 (타입 >= 7)인 경우 full과 increment 모두 필요
    if (type >= 7 && !(scheduleData?.full && scheduleData?.increment)) {
      throw ServiceError.badRequest(ServiceError, {
        method: "validateScheduleConstraints",
        message: "[Schedule 정보 검증] - Schedule data 에러. smart schedule인 경우 full, increment 모두 존재 해야함.",
        metadata: {}
      })
    }
  }

  /**
   * 타입에 따른 스케줄 데이터 추출
   */
  private extractScheduleData({ scheduleData, type }: { scheduleData: ScheduleVerifiInput; type: ScheduleTypeEnum }): { data: ScheduleDetail | ScheduleVerifiInput, mode: 'full' | 'increment' | 'smart' } {
    if (type <= 6) {
      // 일반 타입인 경우 full 또는 increment 사용
      if (scheduleData?.full) {
        return { data: scheduleData.full, mode: 'full' }
      }
      else {
        return { data: scheduleData.increment!, mode: 'increment' }
      }
    } else {
      // 스마트 타입인 경우 (추후 구현)
      // 여기서는 full을 반환하지만, 실제로는 타입에 따라 적절한 데이터 처리 필요
      return { data: scheduleData, mode: 'smart' }
    }
  }

  /**
   * 시간 형식 검증
   */
  private validateTimeCondition({ time }: { time: string | undefined }): string | null {
    if (!time) {
      return "time값이 누락되었습니다."
    }
    if (!regScheduleTimeInput.test(time)) {
      return "time은 'HH:mm' (00:00 ~ 23:59)이어야 합니다."
    }
    return null
  }

  /**
   * 요일 형식 검증
   */
  private validateDayWeekCondition({ day }: { day: string | undefined }): string | null {
    if (!day) {
      return "day값이 누락되었습니다."
    }
    if (!regWeekdaysWithComma.test(day.toLowerCase().replace(regCommaSeparator, ','))) {
      return "day는 mon, tue, wed, thu, fri, sat, sun만 가능합니다."
    }
    return null
  }

  /**
   * 날짜 숫자 형식 검증
   */
  private validateDayNumberCondition({ day }: { day: string | undefined }): string | null {
    if (!day) {
      return "day값이 누락되었습니다."
    }

    day = day.replace(regCommaSeparator, ',')
    if (!regNumbersWithComma.test(day)) {
      return "day는 숫자만 가능합니다."
    }

    const invalidDays = day.split(',').filter(w => {
      const dayNum = Number(w)
      return !(1 <= dayNum && dayNum <= 31)
    })

    if (invalidDays.length > 0) {
      return `day는 1 ~ 31만 가능합니다. 잘못된 값: ${invalidDays.join(', ')}`
    }
    return null
  }

  /**
   * 주차 형식 검증
   */
  private validateWeekCondition({ week }: { week: string | undefined }): string | null {
    if (!week) {
      return "week값이 누락되었습니다."
    }

    week = week.replace(regCommaSeparator, ',')
    if (!regNumbersWithComma.test(week)) {
      return "week는 숫자만 가능합니다."
    }

    const invalidWeeks = week.split(',').filter(w => {
      const weekNum = Number(w)
      return !(1 <= weekNum && weekNum <= 5)
    })

    if (invalidWeeks.length > 0) {
      return `week는 1 ~ 15만 가능합니다. 잘못된 값: ${invalidWeeks.join(', ')}`
    }
    return null
  }

  /**
   * 월 형식 검증
   */
  private validateMonthCondition({ month }: { month: string | undefined }): string | null {
    if (!month) {
      return "month값이 누락되었습니다."
    }

    month = month.replace(regCommaSeparator, ',')
    if (!regNumbersWithComma.test(month)) {
      return "month는 숫자만 가능합니다."
    }

    const invalidMonths = month.split(',').filter(m => {
      const monthNum = Number(m)
      return !(1 <= monthNum && monthNum <= 12)
    })

    if (invalidMonths.length > 0) {
      return `month는 1 ~ 12만 가능합니다. 잘못된 값: ${invalidMonths.join(', ')}`
    }
    return null
  }

  /**
   * 년도 형식 검증
   */
  private validateYearCondition({ year }: { year: string | undefined }): string | null {
    if (!year) {
      return "year값이 누락되었습니다."
    }
    if (!reg4NumberOnly.test(year)) {
      return "year는 0000 ~ 9999만 가능합니다."
    }
    return null
  }

  /**
   * 분 숫자 형식 검증
   */
  private validateMinuteCondition({ minute }: { minute: number | undefined }): string | null {
    if (!minute) {
      return "minute값이 누락되었습니다"
    }
    if (!regNumberOnly.test(String(minute))) {
      return "minute은 숫자만 가능합니다."
    }
    return null
  }

  /**
   * 시간(hour) 숫자 형식 검증
   */
  private validateHourCondition({ hour }: { hour: number | undefined }): string | null {
    if (!hour) {
      return "hour값이 누락되었습니다"
    }
    if (!regNumberOnly.test(String(hour))) {
      return "hour은 숫자만 가능합니다."
    }
    return null
  }

  /**
 * 공통 검증 조건을 적용하여 validation rules 생성
 */
  private createValidationRules({ data, type }: { data: any; type: string }): Array<{ condition: () => boolean; message: string }> {
    const rules: Array<{ condition: () => boolean; message: string }> = []

    // 타입에 따라 필요한 검증 추가
    switch (type) {
      case "Once"://  0
        this.addRuleIfError({ rules, validator: () => this.validateYearCondition({ year: data.year }) })
        this.addRuleIfError({ rules, validator: () => this.validateMonthCondition({ month: data.month }) })
        this.addRuleIfError({ rules, validator: () => this.validateDayNumberCondition({ day: data.day }) })
        this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.time }) })
        break

      case "Every Minute"://  1
        this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.time }) })
        this.addRuleIfError({ rules, validator: () => this.validateMinuteCondition({ minute: data.interval?.minute }) })
        break

      case "Hourly"://  2
        this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.time }) })
        this.addRuleIfError({ rules, validator: () => this.validateHourCondition({ hour: data.interval?.hour }) })
        break

      case "Daily":// 3
        this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.time }) })
        break

      case "Weekly"://  4
        this.addRuleIfError({ rules, validator: () => this.validateDayWeekCondition({ day: data.day }) })
        this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.time }) })
        break

      case "Monthly on Specific Week"://  5
        this.addRuleIfError({ rules, validator: () => this.validateWeekCondition({ week: data.week }) })
        this.addRuleIfError({ rules, validator: () => this.validateDayWeekCondition({ day: data.day }) })
        this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.time }) })
        break

      case "Monthly on Specific Day":// 6
        this.addRuleIfError({ rules, validator: () => this.validateDayNumberCondition({ day: data.day }) })
        this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.time }) })
        break

      case "Smart Weekly By Weekday":// 7
        if (data.full) {
          this.addRuleIfError({ rules, validator: () => this.validateDayWeekCondition({ day: data.full.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.full.time }) })
        }
        if (data.increment) {
          this.addRuleIfError({ rules, validator: () => this.validateDayWeekCondition({ day: data.increment.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.increment.time }) })
        }
        break

      case "Smart Monthly By Week And Weekday":// 8
        if (data.full) {
          this.addRuleIfError({ rules, validator: () => this.validateWeekCondition({ week: data.full.week }) })
          this.addRuleIfError({ rules, validator: () => this.validateDayWeekCondition({ day: data.full.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.full.time }) })
        }
        if (data.increment) {
          this.addRuleIfError({ rules, validator: () => this.validateWeekCondition({ week: data.increment.week }) })
          this.addRuleIfError({ rules, validator: () => this.validateDayWeekCondition({ day: data.increment.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.increment.time }) })
        }
        break

      case "Smart Monthly By Date":// 9
        if (data.full) {
          this.addRuleIfError({ rules, validator: () => this.validateDayNumberCondition({ day: data.full.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.full.time }) })
        }
        if (data.increment) {
          this.addRuleIfError({ rules, validator: () => this.validateDayNumberCondition({ day: data.increment.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.increment.time }) })
        }
        break

      case "Smart Custom Monthly By Week And Day"://  10
        if (data.full) {
          this.addRuleIfError({ rules, validator: () => this.validateMonthCondition({ month: data.full.month }) })
          this.addRuleIfError({ rules, validator: () => this.validateWeekCondition({ week: data.full.week }) })
          this.addRuleIfError({ rules, validator: () => this.validateDayWeekCondition({ day: data.full.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.full.time }) })
        }
        if (data.increment) {
          this.addRuleIfError({ rules, validator: () => this.validateMonthCondition({ month: data.increment.month }) })
          this.addRuleIfError({ rules, validator: () => this.validateWeekCondition({ week: data.increment.week }) })
          this.addRuleIfError({ rules, validator: () => this.validateDayWeekCondition({ day: data.increment.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.increment.time }) })
        }
        break

      case "Smart Custom Monthly By Date"://  11
        if (data.full) {
          this.addRuleIfError({ rules, validator: () => this.validateMonthCondition({ month: data.full.month }) })
          this.addRuleIfError({ rules, validator: () => this.validateDayNumberCondition({ day: data.full.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.full.time }) })
        }
        if (data.increment) {
          this.addRuleIfError({ rules, validator: () => this.validateMonthCondition({ month: data.increment.month }) })
          this.addRuleIfError({ rules, validator: () => this.validateDayNumberCondition({ day: data.increment.day }) })
          this.addRuleIfError({ rules, validator: () => this.validateTimeCondition({ time: data.increment.time }) })
        }
        break
    }

    return rules
  }

  /**
   * 에러 메시지가 있는 경우 규칙 추가
   */
  private addRuleIfError({ rules, validator }: { rules: Array<{ condition: () => boolean; message: string }>; validator: () => string | null }): void {
    const message = validator()
    if (message) { rules.push({ condition: () => true, message }) }
  }

  /**
   * Schedule 검증 - Once (한번)
   */
  private validateOnce({ data }: { data: ScheduleDetail }): OnceScheduleData {
    //  검증
    const validationRules = this.createValidationRules({ data, type: "Once" })
    this.executeValidationRules({ rules: validationRules, type: "Once" })
    this.validateDate({ data, type: "Once" })

    //  DB등록 객체 리턴
    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.ONCE,
      nStatus: 1,
      sYear: data.year,
      sMonth: data.month,
      sDay: data.day,
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Every Minute (매분)
   */
  private validateEveryMinute({ data }: { data: ScheduleDetail }): EveryMinuteScheduleData {
    // 검증
    const validationRules = this.createValidationRules({ data, type: "Every Minute" })
    this.executeValidationRules({ rules: validationRules, type: "Every Minute" })
    this.validateDate({ data, type: "Every Minute" })

    //  DB등록 객체 리턴
    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.EVERY_MINUTE,
      nStatus: 1,
      nPeriodMinute: Number(data.interval.minute),
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Hourly (매시)
   */
  private validateHourly({ data }: { data: ScheduleDetail }): HourlyScheduleData {
    //  검증
    const validationRules = this.createValidationRules({ data, type: "Hourly" })
    this.executeValidationRules({ rules: validationRules, type: "Hourly" })
    this.validateDate({ data, type: "Hourly" })

    //  DB등록 객체 리턴
    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.HOURLY,
      nStatus: 1,
      nPeriodHour: Number(data.interval.hour),
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Daily (매일)
   */
  private validateDaily({ data }: { data: ScheduleDetail }): DailyScheduleData {
    // 검증
    const validationRules = this.createValidationRules({ data, type: "Daily" })
    this.executeValidationRules({ rules: validationRules, type: "Daily" })
    this.validateDate({ data, type: "Daily" })

    //  DB등록 객체 리턴
    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.DAILY,
      nStatus: 1,
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Weekly (매주)
   * day(월~일) 복수 선택 가능
   */
  private validateWeekly({ data }: { data: ScheduleDetail }): WeeklyScheduleData {
    const validationRules = [
      {
        condition: () => !data.day || !regWeekdaysWithComma.test(data.day.toLocaleLowerCase()),
        message: "day는 mon, tue, wed, thu, fri, sat, sun만 가능합니다.",
      },
      {
        condition: () => !data.time,
        message: "time값이 누락되었습니다.",
      },
      {
        condition: () => !regScheduleTimeInput.test(data.time),
        message: "time은 'HH:mm' (00:00 ~ 23:59)이어야 합니다.",
      },
    ]

    this.executeValidationRules({ rules: validationRules, type: "Weekly" })
    const formattedDayWeek = this.validateDayWeek({ data: data.day, type: "Weekly", multiple: true })

    //  DB등록 객체 리턴
    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.WEEKLY,
      nStatus: 1,
      sDayweek: formattedDayWeek,
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Monthly on Specific Week (매월 특정 주)
   * week(1~5) 복수 선택 가능
   * day(월~일) 복수 선택 가능
   */
  private validateMonthlyByWeek({ data }: { data: ScheduleDetail }): MonthlyByWeekScheduleData {
    //  검증
    const validationRules = this.createValidationRules({ data, type: "Monthly on Specific Week" })
    this.executeValidationRules({ rules: validationRules, type: "Monthly on Specific Week" })
    const formattedDayWeek = this.validateDayWeek({ data: data.day, type: "Monthly on Specific Week", multiple: true })
    const formattedWeek = this.validateWeek({ data: data.week, type: "Monthly on Specific Week", multiple: true })

    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_WEEK,
      nStatus: 1,
      sDayweek: formattedDayWeek,
      sWeek: formattedWeek,
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Monthly on Specific Day (매월 특정 일)
   * day(1~31) 복수 선택 가능
   */
  private validateMonthlyByDay({ data }: { data: ScheduleDetail }): MonthlyByDayScheduleData {
    //  검증
    const validationRules = this.createValidationRules({ data, type: "Monthly on Specific Day" })
    this.executeValidationRules({ rules: validationRules, type: "Monthly on Specific Day" })
    const formattedDay = this.validateDay({ data: data.day, type: "Monthly on Specific Day", multiple: true })
    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_DAY,
      nStatus: 1,
      sDate: formattedDay,
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Smart Weekly on Specific Day (매주 특정 요일)
   * full
   * -  day(월~일) 복수 선택 불가
   * increment
   * -  day(월~일) 복수 선택 가능
   */
  private validateSmartWeeklyByWeekday({ data }: { data: Required<ScheduleVerifiInput> }): { full: SmartWeeklyByWeekdayScheduleData, increment: SmartWeeklyByWeekdayScheduleData } {
    //  검증
    const validationRules = this.createValidationRules({ data, type: "Smart Weekly By Weekday" })
    this.executeValidationRules({ rules: validationRules, type: "Smart Weekly By Weekday" })

    // full은 단일 요일만 선택 가능
    const formattedFullDayWeek = this.validateDayWeek({
      data: data.full.day,
      type: "Smart Weekly By Weekday (Full)",
      multiple: false
    })

    // increment는 여러 요일 선택 가능
    const formattedIncrementDayWeek = this.validateDayWeek({
      data: data.increment.day,
      type: "Smart Weekly By Weekday (Increment)",
      multiple: true
    })

    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY,
        nStatus: 1,
        sDayweek: formattedFullDayWeek,
        sTime: data.full!.time,
        nOffset: 0,
        sJobName: "",
      },
      increment: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY,
        nStatus: 1,
        sDayweek: formattedIncrementDayWeek,
        sTime: data.increment!.time,
        nOffset: 0,
        sJobName: "",
      }
    }
  }

  /**
   * Schedule 검증 - Smart Monthly on Specific Week and Day (매월 특정 주, 특정 요일)
   * full
   * -  week(1~5) 복수 선택 불가
   * -  day(월~일) 복수 선택 불가
   * increment
   * -  week(1~5) 복수 선택 가능
   * -  day(월~일) 복수 선택 가능
   */
  private validateSmartMonthlyByWeekAndWeekday({ data }: { data: Required<ScheduleVerifiInput> }): { full: SmartMonthlyByWeekAndWeekdayScheduleData, increment: SmartMonthlyByWeekAndWeekdayScheduleData } {
    //  검증
    const validationRules = this.createValidationRules({ data, type: "Smart Monthly By Week And Weekday" })
    this.executeValidationRules({ rules: validationRules, type: "Smart Monthly By Week And Weekday" })

    // full의 요일과 주 검증
    const formattedFullDayWeek = this.validateDayWeek({
      data: data.full.day,
      type: "Smart Monthly By Week And Weekday (Full)",
      multiple: false
    })

    const formattedFullWeek = this.validateWeek({
      data: data.full.week,
      type: "Smart Monthly By Week And Weekday (Full)",
      multiple: false
    })

    // increment의 요일과 주 검증
    const formattedIncrementDayWeek = this.validateDayWeek({
      data: data.increment.day,
      type: "Smart Monthly By Week And Weekday (Increment)",
      multiple: true
    })

    const formattedIncrementWeek = this.validateWeek({
      data: data.increment.week,
      type: "Smart Monthly By Week And Weekday (Increment)",
      multiple: true
    })

    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_WEEK_AND_DAY,
        nStatus: 1,
        sDayweek: formattedFullDayWeek,
        sWeek: formattedFullWeek,
        sTime: data.full!.time,
        nOffset: 0,
        sJobName: "",
      },
      increment: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_WEEK_AND_DAY,
        nStatus: 1,
        sDayweek: formattedIncrementDayWeek,
        sWeek: formattedIncrementWeek,
        sTime: data.increment!.time,
        nOffset: 0,
        sJobName: "",
      }
    }
  }

  /**
   * Schedule 검증 - Smart Monthly on Specific Date (매월 특정일)
   * full
   * -  day(1~31)   복수 선택 불가
   * increment
   * -  day(1~31)   복수 선택 가능
   */
  private validateSmartMonthlyByDate({ data }: { data: Required<ScheduleVerifiInput> }): { full: SmartMonthlyByDateScheduleData, increment: SmartMonthlyByDateScheduleData } {
    // 검증
    const validationRules = this.createValidationRules({ data, type: "Smart Monthly By Date" })
    this.executeValidationRules({ rules: validationRules, type: "Smart Monthly By Date" })

    // full의 날짜 검증 (단일 선택)
    const formattedFullDate = this.validateDay({
      data: data.full.day,
      type: "Smart Monthly By Date (Full)",
      multiple: false
    })

    // increment의 날짜 검증 (다중 선택)
    const formattedIncrementDate = this.validateDay({
      data: data.increment.day,
      type: "Smart Monthly By Date (Increment)",
      multiple: true
    })

    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_DATE,
        nStatus: 1,
        sDate: formattedFullDate,
        sTime: data.full!.time,
        nOffset: 0,
        sJobName: "",
      },
      increment: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_DATE,
        nStatus: 1,
        sDate: formattedIncrementDate,
        sTime: data.increment!.time,
        nOffset: 0,
        sJobName: "",
      }

    }
  }

  /**
   * Schedule 검증 - Smart Custom Monthly on Specific Month, Week and Day (특정 달, 특정 주, 특정 일)
   * full
   * -  month(1~12) 복수 선택 불가
   * -  week(1~5)   복수 선택 불가
   * -  day(1~31)   복수 선택 불가
   * increment
   * -  month(1~12) 복수 선택 가능
   * -  week(1~5)   복수 선택 가능
   * -  day(1~31)   복수 선택 가능
   */
  private validateSmartCustomMonthlyByWeekAndDay({ data }: { data: Required<ScheduleVerifiInput> }): { full: SmartCustomMonthlyByWeekAndDayScheduleData, increment: SmartCustomMonthlyByWeekAndDayScheduleData } {
    //  검증
    const validationRules = this.createValidationRules({ data, type: "Smart Custom Monthly By Week And Day" })
    this.executeValidationRules({ rules: validationRules, type: "Smart Custom Monthly By Week And Day" })

    // 월, 주, 요일 검증
    // full (단일 선택)
    const formattedFullDayWeek = this.validateDayWeek({
      data: data.full.day,
      type: "Smart Custom Monthly By Week And Day (Full)",
      multiple: false
    })

    const formattedFullWeek = this.validateWeek({
      data: data.full.week,
      type: "Smart Custom Monthly By Week And Day (Full)",
      multiple: false
    })

    // 월 검증
    const formattedFullMonth = this.validateMonth({
      data: data.full.month,
      type: "Smart Custom Monthly By Week And Day (Full)",
      multiple: false
    })

    // increment (다중 선택)
    const formattedIncrementDayWeek = this.validateDayWeek({
      data: data.increment.day,
      type: "Smart Custom Monthly By Week And Day (Increment)",
      multiple: true
    })

    const formattedIncrementWeek = this.validateWeek({
      data: data.increment.week,
      type: "Smart Custom Monthly By Week And Day (Increment)",
      multiple: true
    })

    const formattedIncrementMonth = this.validateMonth({
      data: data.increment.month,
      type: "Smart Custom Monthly By Week And Day (Increment)",
      multiple: true
    })

    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_WEEK_AND_DAY,
        nStatus: 1,
        sDayweek: formattedFullDayWeek,
        sWeek: formattedFullWeek,
        sMonths: formattedFullMonth,
        sTime: data.full!.time,
        nOffset: 0,
        sJobName: "",
      },
      increment: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_WEEK_AND_DAY,
        nStatus: 1,
        sDayweek: formattedIncrementDayWeek,
        sWeek: formattedIncrementWeek,
        sMonths: formattedIncrementMonth,
        sTime: data.increment!.time,
        nOffset: 0,
        sJobName: "",
      }
    }
  }

  /**
   * Schedule 검증 - Smart Custom Monthly on Specific Month and Date (특정 달, 특정 일)
   * full
   * -  month(1~12) 복수 선택 불가
   * -  day(1~31)   복수 선택 불가
   * increment
   * -  month(1~12) 복수 선택 가능
   * -  day(1~31)   복수 선택 가능
   */
  private validateSmartCustomMonthlyByDate({ data }: { data: Required<ScheduleVerifiInput> }): { full: SmartCustomMonthlyByDateScheduleData, increment: SmartCustomMonthlyByDateScheduleData } {
    // 검증
    const validationRules = this.createValidationRules({ data, type: "Smart Custom Monthly By Date" })
    this.executeValidationRules({ rules: validationRules, type: "Smart Custom Monthly By Date" })

    // full의 날짜 검증 (단일 선택)
    const formattedFullDate = this.validateDay({
      data: data.full.day,
      type: "Smart Custom Monthly By Date (Full)",
      multiple: false
    })

    // 월 검증
    const formattedFullMonth = this.validateMonth({
      data: data.full.month,
      type: "Smart Custom Monthly By Date (Full)",
      multiple: false
    })

    // increment의 날짜 검증 (다중 선택)
    const formattedIncrementDate = this.validateDay({
      data: data.increment.day,
      type: "Smart Custom Monthly By Date (Increment)",
      multiple: true
    })

    // 월 검증
    const formattedIncrementMonth = this.validateMonth({
      data: data.increment.month,
      type: "Smart Custom Monthly By Date (Increment)",
      multiple: true
    })

    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_DATE,
        nStatus: 1,
        sDate: formattedFullDate,
        sTime: data.full!.time,
        sMonths: formattedFullMonth,
        nOffset: 0,
        sJobName: "",
      },
      increment: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_DATE,
        nStatus: 1,
        sDate: formattedIncrementDate,
        sTime: data.increment!.time,
        sMonths: formattedIncrementMonth,
        nOffset: 0,
        sJobName: "",
      }
    }
  }


  /**
   * Schedule 검증 - 에러 일괄 처리
   */
  private executeValidationRules({ rules, type }: { rules: { condition: () => boolean; message: string }[]; type: string }): void {
    for (const rule of rules) {
      if (rule.condition()) {
        throw ServiceError.badRequest(ServiceError, {
          method: "executeValidationRules",
          message: `[Schedule 정보 검증] - Schedule data 검증 중 오류 발생 ( ${type} )`,
          error: new Error(rule.message),
          metadata: {},
        })
      }
    }
  }

  /**
   * Schedule 검증 - 날자 유효성 체크
   */
  private validateDate({ data, type }: { data: ScheduleDetail; type: string }): void {
    const dateString = DateTimeUtils.formatDateString({
      year: Number(data.year),
      month: Number(data.month),
      day: Number(data.day),
    })

    if (!DateTimeUtils.isValidDate({ dateString })) {
      throw ServiceError.badRequest(ServiceError, {
        method: "validateDate",
        message: `[Schedule 정보 검증] - Schedule data 검증 중 오류 발생 ( ${type} )`,
        error: new Error(`"${dateString}"은 유효하지 않은 날자입니다.`),
        metadata: {},
      })
    }
  }

  /**
   * Schedule 검증 - 일(1~31) 변환 및 검증
   */
  private validateDay({ data, type, multiple = false }: { data: string, type: string, multiple: boolean }): string {
    try {
      const day = Array.from({ length: 31 }, (_, i) => String(i + 1))
      const days = data.split(',').map(day => day.trim())

      if (!multiple && days.length > 1) {
        throw new Error(`이 스케줄 타입은 여러 날짜를 선택할 수 없습니다. 선택된 날짜: [${days}]`)
      }
      if (!day.length) {
        throw new Error(`유효하지 않은 날짜입니다.`)
      }

      return day.map(d => days.includes(d) ? '1' : '0').join('|') + '|'
    } catch (error) {
      throw ServiceError.badRequest(ServiceError, {
        method: "validateDay",
        message: `[Schedule 정보 검증] - Schedule data 검증 중 오류 발생 ( ${type} )`,
        error,
        metadata: {},
      })
    }
  }

  /**
   * Schedule 검증 - 요일(월~일) 변환 및 검증
   */
  private validateDayWeek({ data, type, multiple = false }: { data: string, type: string, multiple?: boolean }): string {
    try {
      const dayWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      const days = data.toLowerCase().split(',').map(day => day.trim())

      if (!multiple && days.length > 1) {
        throw new Error(`이 스케줄 타입은 여러 요일을 선택할 수 없습니다. 선택된 요일: [${days}]`)
      }
      if (!days.length) {
        throw new Error(`유효하지 않은 요일입니다.`)
      }

      return dayWeek.map(day => days.includes(day) ? '1' : '0').join('|') + '|'
    } catch (error) {
      throw ServiceError.badRequest(ServiceError, {
        method: "validateDayWeek",
        message: `[Schedule 정보 검증] - Schedule data 검증 중 오류 발생 ( ${type} )`,
        error,
        metadata: {},
      })
    }
  }

  /**
   * Schedule 검증 - 주 변환 및 검증
   */
  private validateWeek({ data, type, multiple = false }: { data: string, type: string, multiple: boolean }): string {
    try {
      const week = Array.from({ length: 5 }, (_, i) => String(i + 1))
      const weeks = data.split(',').map(week => week.trim())

      if (!multiple && weeks.length > 1) {
        throw new Error(`이 스케줄 타입은 여러 주를 선택할 수 없습니다. 선택된 주: [${weeks}]`)
      }
      if (!weeks.length) {
        throw new Error(`유효하지 않은 주 입니다.`)
      }

      return week.map(w => weeks.includes(w) ? '1' : '0').join('|') + '|'
    } catch (error) {
      throw ServiceError.badRequest(ServiceError, {
        method: "validateWeek",
        message: `[Schedule 정보 검증] - Schedule data 검증 중 오류 발생 ( ${type} )`,
        error,
        metadata: {},
      })
    }
  }

  /**
     * Schedule 검증 - 월 변환 및 검증
     */
  private validateMonth({ data, type, multiple = false }: { data: string, type: string, multiple: boolean }): string {
    try {
      const month = Array.from({ length: 12 }, (_, i) => String(i + 1))
      const months = data.split(',').map(month => month.trim())

      if (!multiple && months.length > 1) {
        throw new Error(`이 스케줄 타입은 여러 월을 선택할 수 없습니다. 선택된 월: [${month}]`)
      }
      if (!months.length) {
        throw new Error(`유효하지 않은 월 입니다.`)
      }

      // 월별 이진 패턴 생성
      return month.map(m => months.includes(m) ? '1' : '0').join('|') + '|'
    } catch (error) {
      throw ServiceError.badRequest(ServiceError, {
        method: "validateMonth",
        message: `[Schedule 정보 검증] - Schedule data 검증 중 오류 발생 ( ${type} )`,
        error,
        metadata: {},
      })
    }
  }
}
