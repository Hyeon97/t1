import { LogFormat } from "../types/common/log"

export type Environment = "development" | "production" | "test"
export interface Config {
  port: number
  environment: Environment
  apiPrefix: string
  logLevel: string
  logDir: string
  logFormat: LogFormat
}