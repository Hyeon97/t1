import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import customParseFormat from "dayjs/plugin/customParseFormat"
import relativeTime from "dayjs/plugin/relativeTime"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"

// 플러그인 확장
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(advancedFormat)
dayjs.extend(customParseFormat)

/**
 * 날짜 및 시간 포맷 유틸리티 클래스
 * dayjs 라이브러리를 활용한 공통 날짜 포맷 기능 제공
 */
export class DateTimeUtils {
  /**
   * 날자 포멧 YYYY-MM-DD 로 변경
   */
  static formatDateString({ year, month, day }: { year: number; month: number; day: number }): string {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  /**
   * 현재 시간을 기본 포맷(YYYY-MM-DD HH:mm:ss)으로 반환
   */
  static getCurrentTime(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss")
  }

  /**
   * 현재 시간을 밀리초 포함 포맷(YYYY-MM-DD HH:mm:ss.SSS)으로 반환
   */
  static getCurrentTimeWithMs(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss.SSS")
  }

  /**
   * 타임스탬프를 기본 포맷으로 변환
   * @param timestamp Unix 타임스탬프(밀리초)
   */
  static formatTimestamp({ timestamp }: { timestamp: number }): string {
    return dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss")
  }

  /**
   * 타임스탬프를 밀리초 포함 포맷으로 변환
   * @param timestamp Unix 타임스탬프(밀리초)
   */
  static formatTimestampWithMs({ timestamp }: { timestamp: number }): string {
    return dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss.SSS")
  }

  /**
   * 타임스탬프를 커스텀 포맷으로 변환
   * @param timestamp Unix 타임스탬프(밀리초)
   * @param format 커스텀 포맷 문자열
   */
  static formatTimestampCustom({ timestamp, format }: { timestamp: number; format: string }): string {
    return dayjs(timestamp).format(format)
  }

  /**
   * 현재 시간을 커스텀 포맷으로 반환
   * @param format 커스텀 포맷 문자열
   */
  static formatCurrentTimeCustom({ format }: { format: string }): string {
    return dayjs().format(format)
  }

  /**
   * ISO 문자열을 기본 포맷으로 변환
   * @param isoString ISO 날짜 문자열
   */
  static formatISOString({ isoString }: { isoString: string }): string {
    return dayjs(isoString).format("YYYY-MM-DD HH:mm:ss")
  }

  /**
   * 상대적 시간 표현으로 변환 (예: '3시간 전', '2일 전')
   * @param timestamp Unix 타임스탬프(밀리초)
   */
  static formatRelativeTime({ timestamp }: { timestamp: number }): string {
    return dayjs(timestamp).fromNow()
  }

  /**
   * 로깅용 타임스탬프 포맷 (YYYY-MM-DD HH:mm:ss.SSS)
   */
  static getLogTimestamp(): string {
    return dayjs().format("YYYY-MM-DD HH:mm:ss.SSS")
  }

  /**
   * 날짜만 포맷 (YYYY-MM-DD)
   * @param timestamp Unix 타임스탬프(밀리초)
   */
  static formatDateOnly({ timestamp }: { timestamp?: number } = {}): string {
    return dayjs(timestamp).format("YYYY-MM-DD")
  }

  /**
   * 시간만 포맷 (HH:mm:ss)
   * @param timestamp Unix 타임스탬프(밀리초)
   */
  static formatTimeOnly({ timestamp }: { timestamp?: number } = {}): string {
    return dayjs(timestamp).format("HH:mm:ss")
  }

  /**
   * 날짜 비교: 이전인지 확인
   * @param date1 비교할 첫 번째 날짜
   * @param date2 비교할 두 번째 날짜
   * @returns date1이 date2보다 이전이면 true
   */
  static isBefore({ date1, date2 }: { date1: Date | string | number; date2: Date | string | number }): boolean {
    return dayjs(date1).isBefore(dayjs(date2))
  }

  /**
   * 날짜 비교: 이후인지 확인
   * @param date1 비교할 첫 번째 날짜
   * @param date2 비교할 두 번째 날짜
   * @returns date1이 date2보다 이후면 true
   */
  static isAfter({ date1, date2 }: { date1: Date | string | number; date2: Date | string | number }): boolean {
    return dayjs(date1).isAfter(dayjs(date2))
  }

  /**
   * 기간 계산 (밀리초)
   * @param startTime 시작 시간
   * @param endTime 종료 시간 (기본값: 현재 시간)
   * @returns 밀리초 단위의 기간
   */
  static getDuration({ startTime, endTime = Date.now() }: { startTime: number; endTime?: number }): number {
    return endTime - startTime
  }

  /**
   * 날짜 문자열의 유효성 검사
   * @param dateString 검사할 날짜 문자열
   * @param format 예상 포맷 (기본값: 'YYYY-MM-DD')
   */
  static isValidDate({ dateString, format = "YYYY-MM-DD" }: { dateString: string; format?: string }): boolean {
    return dayjs(dateString, format, true).isValid()
  }

  /**
   * 날짜에 일수를 더하거나 빼기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @param days 더할 일수 (음수면 빼기)
   * @returns YYYY-MM-DD 형식의 날짜 문자열
   */
  static addDays({ date, days }: { date: string | Date; days: number }): string {
    return dayjs(date).add(days, 'day').format('YYYY-MM-DD')
  }

  /**
   * 다음 날짜 구하기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @returns YYYY-MM-DD 형식의 다음 날짜 문자열
   */
  static getNextDay({ date }: { date: string | Date }): string {
    return this.addDays({ date, days: 1 })
  }

  /**
   * 이전 날짜 구하기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @returns YYYY-MM-DD 형식의 이전 날짜 문자열
   */
  static getPreviousDay({ date }: { date: string | Date }): string {
    return this.addDays({ date, days: -1 })
  }

  /**
   * 날짜에 월수를 더하거나 빼기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @param months 더할 월수 (음수면 빼기)
   * @returns YYYY-MM-DD 형식의 날짜 문자열
   */
  static addMonths({ date, months }: { date: string | Date; months: number }): string {
    return dayjs(date).add(months, 'month').format('YYYY-MM-DD')
  }

  /**
   * 날짜에 년수를 더하거나 빼기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @param years 더할 년수 (음수면 빼기)
   * @returns YYYY-MM-DD 형식의 날짜 문자열
   */
  static addYears({ date, years }: { date: string | Date; years: number }): string {
    return dayjs(date).add(years, 'year').format('YYYY-MM-DD')
  }

  /**
   * 날짜에 시간을 더하거나 빼기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @param hours 더할 시간수 (음수면 빼기)
   * @returns YYYY-MM-DD HH:mm:ss 형식의 날짜시간 문자열
   */
  static addHours({ date, hours }: { date: string | Date; hours: number }): string {
    return dayjs(date).add(hours, 'hour').format('YYYY-MM-DD HH:mm:ss')
  }

  /**
   * 날짜에 분을 더하거나 빼기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @param minutes 더할 분수 (음수면 빼기)
   * @returns YYYY-MM-DD HH:mm:ss 형식의 날짜시간 문자열
   */
  static addMinutes({ date, minutes }: { date: string | Date; minutes: number }): string {
    return dayjs(date).add(minutes, 'minute').format('YYYY-MM-DD HH:mm:ss')
  }

  /**
   * 월의 시작일 구하기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @returns YYYY-MM-DD 형식의 월 시작일 문자열
   */
  static getStartOfMonth({ date }: { date: string | Date }): string {
    return dayjs(date).startOf('month').format('YYYY-MM-DD')
  }

  /**
   * 월의 마지막일 구하기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @returns YYYY-MM-DD 형식의 월 마지막일 문자열
   */
  static getEndOfMonth({ date }: { date: string | Date }): string {
    return dayjs(date).endOf('month').format('YYYY-MM-DD')
  }

  /**
   * 년의 시작일 구하기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @returns YYYY-MM-DD 형식의 년 시작일 문자열
   */
  static getStartOfYear({ date }: { date: string | Date }): string {
    return dayjs(date).startOf('year').format('YYYY-MM-DD')
  }

  /**
   * 년의 마지막일 구하기
   * @param date 기준 날짜 (문자열 또는 Date 객체)
   * @returns YYYY-MM-DD 형식의 년 마지막일 문자열
   */
  static getEndOfYear({ date }: { date: string | Date }): string {
    return dayjs(date).endOf('year').format('YYYY-MM-DD')
  }

  /**
   * 현재 날짜를 YYYY-MM-DD 형식으로 반환
   */
  static getCurrentDate(): string {
    return dayjs().format('YYYY-MM-DD')
  }

  /**
   * 날짜 문자열을 Date 객체로 변환
   * @param dateString 날짜 문자열
   * @returns Date 객체
   */
  static toDate({ dateString }: { dateString: string }): Date {
    return dayjs(dateString).toDate()
  }

  /**
   * 요일 구하기 (0: 일요일, 1: 월요일, ..., 6: 토요일)
   * @param date 날짜 (문자열 또는 Date 객체)
   * @returns 요일 번호 (0-6)
   */
  static getDayOfWeek({ date }: { date: string | Date }): number {
    return dayjs(date).day()
  }

  /**
   * 요일 이름 구하기
   * @param date 날짜 (문자열 또는 Date 객체)
   * @param locale 언어 설정 (기본값: 'en')
   * @returns 요일 이름
   */
  static getDayName({ date, locale = 'en' }: { date: string | Date; locale?: string }): string {
    return dayjs(date).locale(locale).format('dddd')
  }
}