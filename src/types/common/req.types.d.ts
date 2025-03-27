import { Request } from "express"

// Express 요청 객체 확장
export interface ExtendedRequest extends Request {
  user?: {
    id: number
    email: string
  }
}
