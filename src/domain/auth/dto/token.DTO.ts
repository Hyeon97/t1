import { Expose } from "class-transformer"
import { IsEmail, IsNotEmpty } from "class-validator"

/**
 * 토큰 발급 요청 body DTO
 */
export class TokenIssueBodyDTO {
  @IsEmail({}, { message: "유효한 이메일 형식이 아닙니다" })
  @IsNotEmpty({ message: "email은 필수 입력값입니다" })
  @Expose()
  email: string = ""

  @IsNotEmpty({ message: "password는 필수 입력값입니다" })
  @Expose()
  password: string = ""
}

/**
 * 토큰 응답 DTO 인터페이스
 */
export interface TokenResponseFields {
  token: string
}

/**
 * 토큰 응답 DTO
 */
export class TokenResponseDTO {
  token: string

  constructor({ token = "" }: Partial<TokenResponseFields> = {}) {
    this.token = token
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    return {
      token: this.token,
    }
  }

  /**
   * 엔티티에서 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ tokenData }: { tokenData: { token: string; expiresAt: Date } }): TokenResponseDTO {
    return new TokenResponseDTO({
      token: tokenData.token,
    })
  }
}
