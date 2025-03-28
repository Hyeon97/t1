import { AppError } from "../../errors/AppError"
import { asyncLocalStorage } from "../asyncContext"
import { logger } from "./logger.util"

export class ContextLogger {
  /**
   * 요청 ID를 로그 메시지에 포함하는 형식을 생성
   */
  private static formatMessage({ message }: { message: string }): string {
    const context = asyncLocalStorage.getStore()

    if (!context || !context.requestId) {
      return message
    }

    // 메시지 앞에 요청 ID 추가
    return `[${context.requestId}] ${message}`
  }

  /**
   * 정보 로그
   */
  static info({ message, meta = {} }: { message: string; meta?: Record<string, any> }): void {
    const formattedMessage = this.formatMessage({ message })
    logger.info(formattedMessage, meta)
  }

  /**
   * 에러 로그 - 에러 객체와 위치 정보 지원
   */
  static error({ message, error, meta = {} }: { message: string; error?: AppError | Error; meta?: Record<string, any> }): void {
    let formattedMessage = this.formatMessage({ message })

    // AppError인 경우 위치 정보 추가 (errorLocation 속성이 있는 경우)
    // if (error && error instanceof AppError && (error as any).errorLocation) {
    //   formattedMessage += ` [at ${(error as any).errorLocation}]`
    // }

    if (error && error instanceof AppError) {
      const errorFunc = error?.stack?.split('\n')[1].trim().split(' ')[1]
      formattedMessage += ` [at ${errorFunc}]`
    }

    logger.error(formattedMessage, meta)
  }

  /**
   * 경고 로그
   */
  static warn({ message, meta = {} }: { message: string; meta?: Record<string, any> }): void {
    const formattedMessage = this.formatMessage({ message })
    logger.warn(formattedMessage, meta)
  }

  /**
   * 디버그 로그
   */
  static debug({ message, meta = {} }: { message: string; meta?: Record<string, any> }): void {
    const formattedMessage = this.formatMessage({ message })
    logger.debug(formattedMessage, meta)
  }

  /**
   * HTTP 로그
   */
  static http({ message, meta = {} }: { message: string; meta?: Record<string, any> }): void {
    const formattedMessage = this.formatMessage({ message })
    logger.http(formattedMessage, meta)
  }
}