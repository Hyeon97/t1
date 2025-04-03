export interface ErrorDetails {
  functionName: string
  message: string
  cause?: unknown
  metadata?: Record<string, any>
}

export class BaseError extends Error {
  public readonly functionName: string
  public readonly cause?: unknown
  public readonly metadata?: Record<string, any>

  constructor({ functionName, message, cause, metadata }: ErrorDetails) {
    super(message)
    this.name = this.constructor.name
    this.functionName = functionName
    this.cause = cause
    this.metadata = metadata

    // 스택 트레이스 보존
    Error.captureStackTrace(this, this.constructor)
  }
}
