import { ErrorCode, ErrorLayer, ErrorParams, NewError } from ".."

/**
 * 데이터베이스 계층의 에러를 처리하는 클래스
 * 공통 팩토리 메서드를 상속받아 간소화
 */
export class DatabaseError extends NewError {
  constructor(
    params: ErrorParams & {
      request?: string
      query?: string
      params?: any[]
    }
  ) {
    const details: Record<string, any> = { ...(params.metadata || {}) }
    if (params.query) details.query = params.query
    if (params.params) details.params = params.params
    if (params.request && params.request !== "-") details.request = params.request
    super({
      ...params,
      layer: ErrorLayer.DATABASE,
      metadata: details,
    })
  }

  // 일반 에러를 현재 타입으로 변환
  static fromError<T extends NewError = DatabaseError>(error: unknown, params: Omit<ErrorParams, "errorCode" | "statusCode" | "cause">): T {
    return NewError.fromError(DatabaseError, error, {
      ...params,
      layer: ErrorLayer.DATABASE,
      errorCode: ErrorCode.DATABASE_ERROR,
    }) as unknown as T
  }

  // 연결 오류
  static connectionError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
      request: "",
      query: "",
      params: [],
    }
  ): DatabaseError {
    return NewError.createFrom(DatabaseError, {
      ...params,
      request: params.request,
      query: params.query,
      params: params.params,
      layer: ErrorLayer.DATABASE,
      errorCode: ErrorCode.CONNECTION_ERROR,
      statusCode: 500,
    })
  }

  // 쿼리 실행 오류
  static queryError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
      request: "",
      query: "",
      params: [],
    }
  ): DatabaseError {
    return NewError.createFrom(DatabaseError, {
      ...params,
      request: params.request,
      query: params.query,
      params: params.params,
      layer: ErrorLayer.DATABASE,
      errorCode: ErrorCode.QUERY_ERROR,
      statusCode: 500,
    })
  }

  // 데이터 무결성 오류
  static dataIntegrityError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
      request: "",
      query: "",
      params: [],
    }
  ): DatabaseError {
    return NewError.createFrom(DatabaseError, {
      ...params,
      request: params.request,
      query: params.query,
      params: params.params,
      layer: ErrorLayer.DATABASE,
      errorCode: ErrorCode.DATA_INTEGRITY_ERROR,
      statusCode: 500,
    })
  }

  // 레코드 찾기 실패
  static recordNotFound(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
      request: "",
      query: "",
      params: [],
    }
  ): DatabaseError {
    return NewError.createFrom(DatabaseError, {
      ...params,
      request: params.request,
      query: params.query,
      params: params.params,
      layer: ErrorLayer.DATABASE,
      errorCode: ErrorCode.NOT_FOUND,
      statusCode: 404,
    })
  }

  // 트랜잭션 오류
  static transactionError(
    params: Omit<ErrorParams, "errorCode" | "statusCode" | "layer"> = {
      method: "",
      message: "",
      request: "",
      query: "",
      params: [],
    }
  ): DatabaseError {
    return NewError.createFrom(DatabaseError, {
      ...params,
      request: params.request,
      query: params.query,
      params: params.params,
      layer: ErrorLayer.DATABASE,
      errorCode: ErrorCode.TRANSACTION_ERROR,
      statusCode: 500,
    })
  }
}
