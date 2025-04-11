import { Response } from "express"
import { asyncContextStorage } from "../AsyncContext"
import { ApiResponseDTO } from "./api.DTO"

interface SuccessResponseOptions<T> {
  res: Response
  data: T
  statusCode?: number
  message?: string
}

interface ErrorResponseOptions {
  res: Response
  error: string | string[]
  statusCode: number
}

/**
 * API 응답 유틸리티
 */
export class ApiUtils {
  /**
   * 성공 응답 생성
   */
  static success<T>({ res, data, statusCode = 200, message }: SuccessResponseOptions<T>): Response {
    const taskId = asyncContextStorage.getTaskID()
    const response: ApiResponseDTO<T> = {
      requestID: taskId || "-",
      message,
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }

    return res.status(statusCode).json(response)
  }

  /**
   * 오류 응답 생성
   */
  static error({ res, error, statusCode }: ErrorResponseOptions): Response {
    const errorMessage = Array.isArray(error) ? error.join(", ") : error
    const taskId = asyncContextStorage.getTaskID()
    const response: ApiResponseDTO<null> = {
      requestID: taskId || "-",
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }

    return res.status(statusCode).json(response)
  }
}
