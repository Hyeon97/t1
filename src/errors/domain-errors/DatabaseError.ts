import { ApiError } from '../ApiError'
import { DomainError } from './DomainError'

// 데이터베이스 에러의 기본 클래스
export abstract class DatabaseError extends DomainError {
  query?: string
  params?: any[]

  constructor(message: string, query?: string, params?: any[]) {
    super(message)
    this.query = query
    this.params = params

    // 민감한 정보 필터링
    if (this.params && Array.isArray(this.params)) {
      this.params = this.params.map(param => {
        if (typeof param === 'string' && param.includes('password')) {
          return '[FILTERED]'
        }
        return param
      })
    }
  }
}

// 데이터베이스 연결 에러
export class ConnectionError extends DatabaseError {
  toApiError(): ApiError {
    return ApiError.serviceUnavailable({
      message: this.message,
      details: { error: 'database_connection_error' }
    })
  }
}

// 쿼리 실행 에러
export class QueryError extends DatabaseError {
  toApiError(): ApiError {
    return ApiError.databaseError({
      message: '데이터베이스 쿼리 오류가 발생했습니다',
      details: { error: 'query_execution_error' }
    })
  }
}

// 트랜잭션 에러
export class TransactionError extends DatabaseError {
  toApiError(): ApiError {
    return ApiError.databaseError({
      message: '데이터베이스 트랜잭션 오류가 발생했습니다',
      details: { error: 'transaction_error' }
    })
  }
}

// 데이터 무결성 위반 에러
export class DataIntegrityError extends DatabaseError {
  toApiError(): ApiError {
    return ApiError.conflict({
      message: this.message,
      details: { error: 'data_integrity_violation' }
    })
  }
}

// 데이터를 찾을 수 없음 에러
export class RecordNotFoundError extends DatabaseError {
  toApiError(): ApiError {
    return ApiError.notFound({
      message: this.message,
      details: { error: 'record_not_found' }
    })
  }
}