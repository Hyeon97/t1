/**
 * API 응답에 대한 기본 DTO 인터페이스
 */
export interface ApiResponseDTO<T> {
  success: boolean
  requestID: string
  data?: T
  message?: string
  error?: string
  timestamp: string
}
