import fs from "fs"
import morgan, { StreamOptions } from "morgan"
import path from "path"
import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { configManager } from "../../config/config-manager"
// import { config } from "../../config/config"

// 로그 디렉토리 생성
let logDir = configManager.getLogDir()
if (process.env.NODE_ENV === "development") {
  logDir = path.join(logDir, "development")
}
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
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
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info
    // 메타데이터가 있으면 포함
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : ""
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
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : ""
    return `${timestamp} ${level}: ${message}${metaStr}`
  })
)

// 일별 로테이팅 파일 전송자 설정
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, `/main/application-%DATE%.log`),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  maxSize: "20m",
  zippedArchive: true,
  level: configManager.getLogLevel()
})

// 에러 로그용 일별 로테이팅 파일 전송자 설정
const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, `/error/error-%DATE%.log`),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  maxSize: "20m",
  zippedArchive: true,
  level: "error",
})

// Winston 로거 생성
export const logger = winston.createLogger({
  level: configManager.getLogLevel(),
  levels,
  format: logFormat,
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
export const stream: StreamOptions = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}

// Morgan 미들웨어 생성 함수
export const morganMiddleware = morgan(configManager.getLogFormat(), { stream })

// 로깅 초기화 메시지
logger.info(`로그 시스템 초기화 완료 (${configManager.getEnv()} 환경) || 저장 경로 ${logDir}`)
