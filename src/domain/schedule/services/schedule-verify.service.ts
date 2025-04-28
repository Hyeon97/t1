import { ServiceError } from "../../../errors"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { DateTimeUtils } from "../../../utils/Dayjs.utils"
import { reg4NumberOnly, regNumberOnly, regNumbersWithComma, regScheduleTimeInput, regWeekdaysWithComma } from "../../../utils/regex.utils"
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
      const data = this.extractScheduleData({ scheduleData, type })

      // 타입별 검증 분기
      let result = null
      switch (type) {
        case ScheduleTypeEnum.ONCE:
          result = this.validateOnce({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.EVERY_MINUTE:
          result = this.validateEveryMinute({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.HOURLY:
          result = this.validateHourly({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.DAILY:
          result = this.validateDaily({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.WEEKLY:
          result = this.validateWeekly({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_WEEK:
          result = this.validateMonthlyByWeek({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_DAY:
          result = this.validateMonthlyByDay({ data: data as ScheduleDetail })
          break
        case ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY:
          result = this.validateSmartWeeklyByWeekday({ data: data as ScheduleVerifiInput })
          break
        case ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_WEEK_AND_DAY:
          result = this.validateSmartMonthlyByWeekAndWeekday({ data: data as ScheduleVerifiInput })
          break
        case ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_DATE:
          result = this.validateSmartMonthlyByDate({ data: data as ScheduleVerifiInput })
          break
        case ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_WEEK_AND_DAY:
          result = this.validateSmartCustomMonthlyByWeekAndDay({ data: data as ScheduleVerifiInput })
          break
        case ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_DATE:
          result = this.validateSmartCustomMonthlyByDate({ data: data as ScheduleVerifiInput })
          break
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "validateSchedule", state: "end" })
      return result
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
  private extractScheduleData({ scheduleData, type }: { scheduleData: ScheduleVerifiInput; type: ScheduleTypeEnum }): ScheduleDetail | ScheduleVerifiInput {
    if (type <= 6) {
      // 일반 타입인 경우 full 또는 increment 사용
      return (scheduleData?.full || scheduleData?.increment)!
    } else {
      // 스마트 타입인 경우 (추후 구현)
      // 여기서는 full을 반환하지만, 실제로는 타입에 따라 적절한 데이터 처리 필요
      return scheduleData
    }
  }


  /**
   * Schedule 검증 - Once (한번)
   */
  private validateOnce({ data }: { data: ScheduleDetail }): OnceScheduleData {
    const validationRules = [
      {
        condition: () => !data.year || !reg4NumberOnly.test(data.year),
        message: "year는 0000 ~ 9999만 가능합니다.",
      },
      {
        condition: () => !data.month || !regNumberOnly.test(data.month) || !(1 <= Number(data.month) && Number(data.month) <= 12),
        message: "month는 1 ~ 12만 가능합니다.",
      },
      {
        condition: () => !data.day || !regNumberOnly.test(data.day) || !(1 <= Number(data.day) && Number(data.day) <= 31),
        message: "day는 1 ~ 31만 가능합니다.",
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

    this.executeValidationRules({ rules: validationRules, type: "Once" })
    this.validateDateValidity({ data, type: "Once" })

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
    const validationRules = [
      {
        condition: () => !data.time,
        message: "time값이 누락되었습니다.",
      },
      {
        condition: () => !regScheduleTimeInput.test(data.time),
        message: "time은 'HH:mm' (00:00 ~ 23:59)이어야 합니다.",
      },
      {
        condition: () => !data.interval.minute,
        message: "minute값이 누락되었습니다",
      },
      {
        condition: () => !regNumberOnly.test(String(data.interval.minute)),
        message: "minute은 숫자만 가능합니다.",
      },
    ]

    this.executeValidationRules({ rules: validationRules, type: "Every Minute" })
    this.validateDateValidity({ data, type: "Every Minute" })

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
    const validationRules = [
      {
        condition: () => !data.time,
        message: "time값이 누락되었습니다.",
      },
      {
        condition: () => !regScheduleTimeInput.test(data.time),
        message: "time은 'HH:mm' (00:00 ~ 23:59)이어야 합니다.",
      },
      {
        condition: () => !data.interval.hour,
        message: "hour값이 누락되었습니다",
      },
      {
        condition: () => !regNumberOnly.test(String(data.interval.hour)),
        message: "hour은 숫자만 가능합니다.",
      },
    ]

    this.executeValidationRules({ rules: validationRules, type: "Hourly" })
    this.validateDateValidity({ data, type: "Hourly" })

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
    const validationRules = [
      {
        condition: () => !data.time,
        message: "time값이 누락되었습니다.",
      },
      {
        condition: () => !regScheduleTimeInput.test(data.time),
        message: "time은 'HH:mm' (00:00 ~ 23:59)이어야 합니다.",
      },
    ]

    this.executeValidationRules({ rules: validationRules, type: "Daily" })
    this.validateDateValidity({ data, type: "Daily" })

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
   * day 복수 선택 가능
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

    this.executeValidationRules({ rules: validationRules, type: "Daily" })
    this.validateDateValidity({ data, type: "Daily" })

    //  DB등록 객체 리턴
    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.WEEKLY,
      nStatus: 1,
      sDayweek: data.day,
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Monthly on Specific Week (매월 특정 주)
   * week 복수 선택 가능
   * day 복수 선택 가능
   */
  private validateMonthlyByWeek({ data }: { data: ScheduleDetail }): MonthlyByWeekScheduleData {
    const validationRules = [
      {
        condition: () => !data.week || !regNumbersWithComma.test(data.week),
        message: "week는 숫자만 가능합니다.",
      },
      {
        condition: () => !data.day || !regWeekdaysWithComma.test(data.day),
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

    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_WEEK,
      nStatus: 1,
      sDayweek: data.day,
      sWeek: data.week,
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Monthly on Specific Day (매월 특정 일)
   */
  private validateMonthlyByDay({ data }: { data: ScheduleDetail }): MonthlyByDayScheduleData {
    const validationRules = []
    return {
      nID: 0,
      nUserID: 0,
      nCenterID: 0,
      nScheduleType: ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_DAY,
      nStatus: 1,
      sDate: data.day,
      sTime: data.time,
      nOffset: 0,
      sJobName: "",
    }
  }

  /**
   * Schedule 검증 - Smart Weekly on Specific Day (매주 특정 요일)
   */
  private validateSmartWeeklyByWeekday({ data }: { data: ScheduleVerifiInput }): { full: SmartWeeklyByWeekdayScheduleData, increment: SmartWeeklyByWeekdayScheduleData } {
    const validationRules = []
    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY,
        nStatus: 1,
        sDayweek: data.full!.day,
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
        sDayweek: data.increment!.day,
        sTime: data.increment!.time,
        nOffset: 0,
        sJobName: "",
      }
    }
  }

  /**
   * Schedule 검증 - Smart Monthly on Specific Week and Day (매월 특정 주, 특정 요일)
   */
  private validateSmartMonthlyByWeekAndWeekday({ data }: { data: ScheduleVerifiInput }): { full: SmartMonthlyByWeekAndWeekdayScheduleData, increment: SmartMonthlyByWeekAndWeekdayScheduleData } {
    const validationRules = []
    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_WEEK_AND_DAY,
        nStatus: 1,
        sDayweek: data.full!.day,
        sWeek: data.full!.week,
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
        sDayweek: data.increment!.day,
        sWeek: data.increment!.week,
        sTime: data.increment!.time,
        nOffset: 0,
        sJobName: "",
      }
    }
  }

  /**
   * Schedule 검증 - Smart Monthly on Specific Date (매월 특정일)
   */
  private validateSmartMonthlyByDate({ data }: { data: ScheduleVerifiInput }): { full: SmartMonthlyByDateScheduleData, increment: SmartMonthlyByDateScheduleData } {
    const validationRules = []
    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_DATE,
        nStatus: 1,
        sDate: data.full!.day,
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
        sDate: data.increment!.day,
        sTime: data.increment!.time,
        nOffset: 0,
        sJobName: "",
      }
    }
  }

  /**
   * Schedule 검증 - Smart Custom Monthly on Specific Month, Week and Day (특정 달, 특정 주, 특정 일)
   */
  private validateSmartCustomMonthlyByWeekAndDay({ data }: { data: ScheduleVerifiInput }): { full: SmartCustomMonthlyByWeekAndDayScheduleData, increment: SmartCustomMonthlyByWeekAndDayScheduleData } {
    const validationRules = []
    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_WEEK_AND_DAY,
        nStatus: 1,
        sDayweek: data.full!.day,
        sWeek: data.full!.week,
        sMonths: data.full!.month,
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
        sDayweek: data.increment!.day,
        sWeek: data.increment!.week,
        sMonths: data.increment!.month,
        sTime: data.increment!.time,
        nOffset: 0,
        sJobName: "",
      }
    }
  }

  /**
   * Schedule 검증 - Smart Custom Monthly on Specific Month and Date (특정 달, 특정 일)
   */
  private validateSmartCustomMonthlyByDate({ data }: { data: ScheduleVerifiInput }): { full: SmartCustomMonthlyByDateScheduleData, increment: SmartCustomMonthlyByDateScheduleData } {
    const validationRules = []
    return {
      full: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_DATE,
        nStatus: 1,
        sDate: data.full!.day,
        sTime: data.full!.time,
        sMonths: data.full!.month,
        nOffset: 0,
        sJobName: "",
      },
      increment: {
        nID: 0,
        nUserID: 0,
        nCenterID: 0,
        nScheduleType: ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_DATE,
        nStatus: 1,
        sDate: data.increment!.day,
        sTime: data.increment!.time,
        sMonths: data.increment!.month,
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
  private validateDateValidity({ data, type }: { data: ScheduleDetail; type: string }): void {
    const dateString = DateTimeUtils.formatDateString({
      year: Number(data.year),
      month: Number(data.month),
      day: Number(data.day),
    })

    if (!DateTimeUtils.isValidDate({ dateString })) {
      throw ServiceError.badRequest(ServiceError, {
        method: "validateDateValidity",
        message: `[Schedule 정보 검증] - Schedule data 검증 중 오류 발생 ( ${type} )`,
        error: new Error(`"${dateString}"은 유효하지 않은 날자입니다.`),
        metadata: {},
      })
    }
  }
}
