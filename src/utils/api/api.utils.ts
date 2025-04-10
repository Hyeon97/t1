import { asyncContextStorage } from "../../middlewares/logging/AsyncContext"
import { ApiResponseDTO } from "./api.DTO"
import { Response } from "express"

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
    const context = asyncContextStorage.getContext()
    const response: ApiResponseDTO<T> = {
      requestID: context?.task!.id || "-",
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
    const context = asyncContextStorage.getContext()
    const response: ApiResponseDTO<null> = {
      requestID: context?.task!.id || "-",
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }

    return res.status(statusCode).json(response)
  }
}
