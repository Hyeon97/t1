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
}
