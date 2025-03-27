/**
 * 토큰 생성시 필요한 데이터 객체 정의
 */
export interface CreateTokenData {
  id: number
  idx: number
  email: string
  password: string
}

/**
 * 토큰 생성 결과 리턴 타입
 */
export interface TokenIssueResponse {
  token: string
  expiresAt: Date
}

/**
 * 토큰 DB 저장 input 타입
 */
export interface TokenDBInput {
  token: string
  mail: string
}

/**
 * 토큰 검증성공시 리턴 타입
 */
export interface TokenVerifySuccessResult {
  id: number
  email: string
  iat: number
  exp: number
}
