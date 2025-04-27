import { ServiceError } from "../../../errors"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { DateTimeUtils } from "../../../utils/Dayjs.utils"
import { reg4NumberOnly, regNumberOnly, regScheduleTimeInput } from "../../../utils/regex.utils"
import { ScheduleTypeEnum } from "../types/schedule-common.type"
import { ScheduleDetail, ScheduleDBRegistOnce } from "../types/schedule-regist.type"

export class ScheduleVerifiService extends BaseService {
  constructor() {
    super({
      serviceName: "ScheduleVerifiService",
    })
  }

  /**
   * Schedule 검증 - Main
   */
  validateSchedule({ data, type }: { data: ScheduleDetail; type: ScheduleTypeEnum }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "validateSchedule", state: "start" })

      // 타입별 검증 분기
      let result = null
      switch (type) {
        case ScheduleTypeEnum.ONCE:
          result = this.validateScheduleOnce({ data })
          break
        case ScheduleTypeEnum.EVERY_MINUTE:
          break
        case ScheduleTypeEnum.HOURLY:
          break
        case ScheduleTypeEnum.DAILY:
          break
        case ScheduleTypeEnum.WEEKLY:
          break
        case ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_WEEK:
          break
        case ScheduleTypeEnum.MONTHLY_ON_SPECIFIC_DAY:
          break
        case ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY:
          break
        case ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_WEEK_AND_DAY:
          break
        case ScheduleTypeEnum.SMART_MONTHLY_ON_SPECIFIC_DATE:
          break
        case ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_WEEK_AND_DAY:
          break
        case ScheduleTypeEnum.SMART_CUSTOM_MONTHLY_ON_SPECIFIC_MONTH_AND_DATE:
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
   * Schedule 검증 - Once
   */
  private validateScheduleOnce({ data }: { data: ScheduleDetail }): ScheduleDBRegistOnce {
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
        condition: () => !data.time || !regScheduleTimeInput.test(data.time),
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
   * Schedule 검증 에러 일괄 처리
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
