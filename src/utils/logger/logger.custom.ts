import { asyncLocalStorage } from "../asyncContext"
import { logger } from "./logger.util"

export class ContextLogger {
  static info(message: string, meta: Record<string, any> = {}): void {
    const context = asyncLocalStorage.getStore()
    logger.info(message, { ...meta, ...(context || {}) })
  }

  static error(message: string, meta: Record<string, any> = {}): void {
    const context = asyncLocalStorage.getStore()
    logger.error(message, { ...meta, ...(context || {}) })
  }

  static warn(message: string, meta: Record<string, any> = {}): void {
    const context = asyncLocalStorage.getStore()
    logger.warn(message, { ...meta, ...(context || {}) })
  }

  static debug(message: string, meta: Record<string, any> = {}): void {
    const context = asyncLocalStorage.getStore()
    logger.debug(message, { ...meta, ...(context || {}) })
  }
}
