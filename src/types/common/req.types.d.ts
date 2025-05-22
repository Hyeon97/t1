import { Request } from "express"

// Express 요청 객체 확장
export interface ExtendedRequest extends Request {
  user?: AuthenticatedUser
}
//  Express 요청 객체 확장 - User ( 정상 적으로 토큰이 검증된 경우 무조건 존재함 )
export interface AuthenticatedUser {
  id: number
  email: string
}