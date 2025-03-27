import jwt from "jsonwebtoken"
import { CreateTokenData, TokenVerifySuccessResult } from "../domain/auth/interface/token"

const JWT_SECRET = "z1c@o3n$v5e^r7t*e9r)A9P*I7S^e5r$v3e@r1"
const JWT_EXPIRES_IN = "1h"
export class JwtUtil {
  /**
   * JWT 토큰 생성
   */
  public static generateToken({ payload }: { payload: CreateTokenData }): string {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })
    return token
  }

  /**
   * JWT 토큰 검증
   */
  public static verifyToken({ token }: { token: string }): TokenVerifySuccessResult | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenVerifySuccessResult
      return decoded
    } catch (error) {
      return null
    }
  }

  /**
   * 토큰 만료일 계산
   * @returns 만료 날짜
   */
  public static getTokenExpiration(): Date {
    const expiresIn = JWT_EXPIRES_IN
    const unit = expiresIn.slice(-1)
    const value = parseInt(expiresIn.slice(0, -1), 10)

    const now = new Date()
    const expirationDate = new Date(now)

    switch (unit) {
      case "h":
        expirationDate.setHours(now.getHours() + value)
        break
      case "d":
        expirationDate.setDate(now.getDate() + value)
        break
      case "w":
        expirationDate.setDate(now.getDate() + value * 7)
        break
      default:
        // 기본값: 1시간
        expirationDate.setHours(now.getHours() + 1)
    }

    return expirationDate
  }
}
