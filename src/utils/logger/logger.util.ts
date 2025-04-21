import fs from "fs"
import morgan, { StreamOptions } from "morgan"
import path from "path"
import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { configManager } from "../../config/config-manager"
import { DateTimeUtils } from "../Dayjs.utils"

/**
 * 로거 팩토리 클래스
 */
class LoggerFactory {
  private static instance: winston.Logger
  private static morganMiddlewareInstance: any
  private static streamInstance: StreamOptions
  private static logDirInstance: string
  private static initialized = false

  /**
   * 로거 인스턴스 생성 또는 반환
   */
  static getLogger(): winston.Logger {
    if (!this.instance) {
      this.initializeLogger()
    }
    return this.instance
  }

  /**
   * 로그 디렉토리 가져오기
   */
  static getLogDir(): string {
    if (!this.logDirInstance) {
      this.initializeLogger()
    }
    return this.logDirInstance
  }

  /**
   * 모건 미들웨어 가져오기
   */
  static getMorganMiddleware() {
    if (!this.morganMiddlewareInstance) {
      this.initializeLogger()
    }
    return this.morganMiddlewareInstance
  }

  /**
   * 로거 초기화 상태 확인
   */
  static isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 로거 초기화
   */
  private static initializeLogger(): void {
    if (this.initialized) {
      return
    }

    console.log(`${DateTimeUtils.getCurrentTime()} \x1b[32mLoggerFactory 초기화 시작...\x1b[0m`)

    // configManager는 이미 server.ts에서 초기화되었다고 가정
    const logDir = configManager.getLogDir()
    const logLevel = configManager.getLogLevel()
    const logFormat = configManager.getLogFormat()
    const nodeEnv = configManager.getEnv()

    this.logDirInstance = logDir

    // 환경에 따른 로그 디렉토리 설정
    let finalLogDir = logDir
    if (nodeEnv === "development") {
      finalLogDir = path.join(logDir, "development")
      this.logDirInstance = finalLogDir
    }

    // 로그 디렉토리 생성
    if (!fs.existsSync(finalLogDir)) {
      fs.mkdirSync(finalLogDir, { recursive: true })
    }

    // 로그 파일 디렉토리 생성
    const mainLogDir = path.join(finalLogDir, "main")
    const errorLogDir = path.join(finalLogDir, "error")

    if (!fs.existsSync(mainLogDir)) {
      fs.mkdirSync(mainLogDir, { recursive: true })
    }

    if (!fs.existsSync(errorLogDir)) {
      fs.mkdirSync(errorLogDir, { recursive: true })
    }

    // 로그 레벨 정의
    const levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
      silly: 5,
    }

    // 로그 색상 정의
    const colors = {
      error: "red",
      warn: "yellow",
      info: "green",
      http: "magenta",
      debug: "blue",
      silly: "white",
    }

    // Winston에 색상 추가
    winston.addColors(colors)

    // 로그 포맷 정의 - 메타데이터 처리 개선
    const loggerFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info
        // 메타데이터가 있으면 포함
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ""
        return `${timestamp} ${level}: ${message}${metaStr}`
      })
    )

    // 콘솔용 컬러 포맷 정의 - 메타데이터 처리 개선
    const consoleFormat = winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info
        // 메타데이터가 있으면 포함
        const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ""
        return `${timestamp} ${level}: ${message}${metaStr}`
      })
    )

    // 일별 로테이팅 파일 전송자 설정
    const fileRotateTransport = new DailyRotateFile({
      filename: path.join(mainLogDir, `application-%DATE%.log`),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
      zippedArchive: true,
      level: logLevel,
    })

    // 에러 로그용 일별 로테이팅 파일 전송자 설정
    const errorFileRotateTransport = new DailyRotateFile({
      filename: path.join(errorLogDir, `error-%DATE%.log`),
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      maxSize: "20m",
      zippedArchive: true,
      level: "error",
    })

    // Winston 로거 생성
    this.instance = winston.createLogger({
      level: logLevel,
      levels,
      format: loggerFormat,
      transports: [
        // 콘솔 출력
        new winston.transports.Console({
          format: consoleFormat,
        }),
        // 로그 파일 출력
        fileRotateTransport,
        // 에러 로그 파일 출력
        errorFileRotateTransport,
      ],
      exitOnError: false,
    })

    // Morgan 스트림 생성
    this.streamInstance = {
      write: (message: string) => {
        this.instance.http(message.trim())
      },
    }

    // Morgan 미들웨어 생성
    this.morganMiddlewareInstance = morgan(logFormat, { stream: this.streamInstance })

    // 로깅 초기화 메시지
    this.instance.info(`로그 시스템 초기화 완료 (${nodeEnv} 환경) || 저장 경로 ${finalLogDir}`)

    this.initialized = true
    console.log(`${DateTimeUtils.getCurrentTime()} \x1b[32mLoggerFactory 초기화 완료\x1b[0m`)
  }
}

// 로거 인스턴스 내보내기
export const logger = LoggerFactory.getLogger()

// Morgan 스트림 내보내기
export const stream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Morgan 미들웨어 내보내기
export const morganMiddleware = LoggerFactory.getMorganMiddleware()
