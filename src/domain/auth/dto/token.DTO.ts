import { IsEmail, IsNotEmpty } from "class-validator"

//  토큰 발급 요청 body DTO
export class TokenIssueBodyDTO {
  @IsEmail({}, { message: "유효한 이메일 형식이 아닙니다" })
  @IsNotEmpty({ message: "email은 필수 입력값입니다" })
  email: string = ""

  @IsNotEmpty({ message: "password는 필수 입력값입니다" })
  password: string = ""
}

//  기본값 상수
const DEFAULT_VALUES = {
  token: "",
}

//  기본 리턴 객체 정의
export type BaseTokenResponseFields = { token: string }

// 기본 Token 응답 DTO
export class TokenResponseDTO {
  token: string

  constructor({ token = DEFAULT_VALUES.token }: Partial<BaseTokenResponseFields> = {}) {
    this.token = token
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {
      token: this.token,
    }

    return json
  }

  /**
   * 엔티티에서 기본 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ tokenData }: { tokenData: any }): TokenResponseDTO {
    const { token } = tokenData

    return new TokenResponseDTO({
      token,
    })
  }
}
