import jwt from "jsonwebtoken"
import { CreateTokenData, TokenVerifySuccessResult } from "../domain/auth/interface/token"
import { ErrorCode, ErrorLayer } from "../errors"
import { UtilityError } from "../errors/utility/utility-error"

export class JwtUtil {
  /**
   * JWT 시크릿 키 가져오기
   */
  private static getJwtSecret(): string {
    // ConfigManager가 초기화되지 않은 경우를 대비해 환경변수 직접 사용
    return process.env.JWT_SECRET || "z1c@o3n$v5e^r7t*e9r)A9P*I7S^e5r$v3e@r1"
  }

  /**
   * JWT 만료 시간 가져오기
   */
  private static getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || "1h"
  }

  /**
   * JWT 토큰 생성
   */
  public static generateToken({ payload }: { payload: CreateTokenData }): string {
    try {
      const secret = this.getJwtSecret()
      const options = { expiresIn: this.getJwtExpiresIn() }

      return jwt.sign(payload as any, secret as any, options as any)
    } catch (error) {
      throw UtilityError.jwtSignError({
        method: "generateToken",
        message: "JWT 토큰 생성 중 오류가 발생했습니다",
        cause: error,
        metadata: { payloadType: typeof payload },
      })
    }
  }

  /**
   * JWT 토큰 검증
   */
  public static verifyToken({ token }: { token: string }): TokenVerifySuccessResult {
    try {
      const secret = this.getJwtSecret()
      const decoded = jwt.verify(token, secret) as TokenVerifySuccessResult
      return decoded
    } catch (error) {
      // JWT 에러 유형에 따른 구체적인 에러 처리
      if (error instanceof jwt.TokenExpiredError) {
        throw UtilityError.jwtVerifyError({
          method: "verifyToken",
          message: "만료된 Token",
          errorCode: ErrorCode.JWT_EXPIRED,
          cause: error,
        })
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw UtilityError.jwtVerifyError({
          method: "verifyToken",
          message: "유효하지 않은 Token",
          errorCode: ErrorCode.JWT_INVALID,
          cause: error,
        })
      }
      // 일반적인 에러 처리
      throw UtilityError.createFrom(UtilityError, {
        method: "verifyToken",
        message: "Token 검증 실패",
        layer: ErrorLayer.UTILITY,
        errorCode: ErrorCode.JWT_INVALID,
        cause: error,
        statusCode: 502,
      })
    }
  }

  /**
   * 토큰 만료일 계산
   * @returns 만료 날짜
   */
  public static getTokenExpiration(): Date {
    const expiresIn = this.getJwtExpiresIn()
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
