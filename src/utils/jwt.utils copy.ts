// import jwt from "jsonwebtoken"
// import { CreateTokenData, TokenVerifySuccessResult } from "../domain/auth/interface/token"

// export class JwtUtil {
//   /**
//    * JWT 시크릿 키 가져오기
//    */
//   private static getJwtSecret(): string {
//     // ConfigManager가 초기화되지 않은 경우를 대비해 환경변수 직접 사용
//     return process.env.JWT_SECRET || "z1c@o3n$v5e^r7t*e9r)A9P*I7S^e5r$v3e@r1"
//   }

//   /**
//    * JWT 만료 시간 가져오기
//    */
//   private static getJwtExpiresIn(): string {
//     return process.env.JWT_EXPIRES_IN || "1h"
//   }

//   /**
//    * JWT 토큰 생성
//    */
//   public static generateToken({ payload }: { payload: CreateTokenData }): string {
//     // 직접 타입 캐스팅을 하지 않고 일반 객체로 처리
//     const secret = this.getJwtSecret()
//     const options = { expiresIn: this.getJwtExpiresIn() }

//     // any 타입을 사용하여 타입 오류 해결
//     return jwt.sign(payload as any, secret as any, options as any)
//   }

//   /**
//    * JWT 토큰 검증
//    */
//   public static verifyToken({ token }: { token: string }): TokenVerifySuccessResult | null {
//     try {
//       const secret = this.getJwtSecret()
//       const decoded = jwt.verify(token, secret) as unknown as TokenVerifySuccessResult
//       return decoded
//     } catch (error) {
//       return null
//     }
//   }

//   /**
//    * 토큰 만료일 계산
//    * @returns 만료 날짜
//    */
//   public static getTokenExpiration(): Date {
//     const expiresIn = this.getJwtExpiresIn()
//     const unit = expiresIn.slice(-1)
//     const value = parseInt(expiresIn.slice(0, -1), 10)

//     const now = new Date()
//     const expirationDate = new Date(now)

//     switch (unit) {
//       case "h":
//         expirationDate.setHours(now.getHours() + value)
//         break
//       case "d":
//         expirationDate.setDate(now.getDate() + value)
//         break
//       case "w":
//         expirationDate.setDate(now.getDate() + value * 7)
//         break
//       default:
//         // 기본값: 1시간
//         expirationDate.setHours(now.getHours() + 1)
//     }

//     return expirationDate
//   }
// }
