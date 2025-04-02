import { ApiError } from "./ApiError"

/**
 * 모든 도메인 에러의 기본 클래스
 * 모든 도메인 에러는 이 클래스를 상속해야 함
 */
export abstract class AppError extends Error {
  readonly errorLocation: string
  constructor({ message }: { message: string }) {
    super(message)
    this.name = this.constructor.name

    // 에러 발생 위치를 추적합니다
    this.errorLocation = this.captureErrorLocation()

    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * 이 에러를 API 응답에 적합한 ApiError로 변환
   * 모든 자식 클래스에서 구현해야 함
   */
  abstract toApiError(): ApiError

  private captureErrorLocation(): string {
    // 새로운 에러를 생성하여 스택 트레이스를 얻습니다
    const stack = new Error().stack

    if (!stack) return "Unknown location"

    // 스택 트레이스를 줄 단위로 분할
    const stackLines = stack.split("\n")

    // 첫 번째 줄은 Error 생성자, 두 번째 줄은 현재 메서드
    // 세 번째 줄부터 실제 에러 발생 위치가 나타남
    if (stackLines.length >= 3) {
      // 세 번째 줄에서 파일 경로와 라인 번호 추출
      const errorLine = stackLines[2].trim()

      // 'at' 이후의 문자열 추출 (경로와 라인 번호 포함)
      const match = errorLine.match(/at\s+(.*)/)
      if (match && match[1]) {
        return match[1]
      }
    }

    return "Unknown location"
  }
}
