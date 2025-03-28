import { ApiError } from "../../../errors/ApiError"
import { AppError } from "../../../errors/AppError"
import { AuthError } from "../../../errors/domain-errors/AuthError"
import { UserError } from "../../../errors/domain-errors/UserError"
import { JwtUtil } from "../../../utils/jwt.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { UserInfoRepository } from "../../user/repositories/user-info.repository"
import { UserTokenRepository } from "../../user/repositories/user-token.repository"
import { TokenIssueBodyDTO } from "../dto/token.DTO"
import { CreateTokenData, TokenDBInput, TokenVerifySuccessResult } from "../interface/token"

export class TokenService {
  private readonly userInfoRepository: UserInfoRepository
  private readonly userTokenRepository: UserTokenRepository
  constructor({ userInfoRepository, userTokenRepository }: { userInfoRepository: UserInfoRepository; userTokenRepository: UserTokenRepository }) {
    this.userInfoRepository = userInfoRepository
    this.userTokenRepository = userTokenRepository
  }

  /**
   * token 생성
   */
  async createToken({ input }: { input: TokenIssueBodyDTO }) {
    try {
      ContextLogger.debug({
        message: `토큰 생성 시작 - 이메일: ${input.email}`
      })
      //  사용자 조회
      const user = await this.userInfoRepository.findByEmail({ email: input.email })
      //  추후 아래 로직으로 변경
      // const user = await this.userInfoRepository.findByEmailAndPassword({ email: input.email, password: input.password })
      // if (!user) {
      if (!user) {
        throw new UserError.UserNotFound({ user: input.email, type: "Email" })
      }

      // 토큰 생성
      const payload: CreateTokenData = {
        id: user.idx,
        idx: user.idx,
        email: user.email,
        password: user.password,
      }
      const token = JwtUtil.generateToken({ payload })
      const expiresAt = JwtUtil.getTokenExpiration()

      // 토큰 저장
      const saveData: TokenDBInput = {
        token,
        mail: input.email,
      }
      await this.userTokenRepository.saveTokenInfo({ input: saveData })
      ContextLogger.debug({
        message: `사용자 ${input.email}의 토큰이 생성되었습니다`,
        meta: { expiresAt }
      })
      return { token, expiresAt }
    } catch (error: any) {
      // AppError는 그대로 전파 (한 번의 체크로 모든 도메인 에러 처리)
      // ApiError 인스턴스는 그대로 전파
      if (error instanceof AppError || error instanceof ApiError) {
        throw error
      }
      // 기타 예상치 못한 에러는 로깅 후 일반 API 에러로 변환
      ContextLogger.error({
        message: "토큰 생성 중 예상치 못한 오류 발생",
        meta: {
          error: error instanceof Error ? error.message : String(error)
        }
      })
      throw ApiError.internal({ message: "토큰 생성 중 서버 오류가 발생했습니다" })
    }
  }

  /**
   * token 검증
   */
  async verifyToken({ token }: { token: string }): Promise<TokenVerifySuccessResult> {
    ContextLogger.debug({
      message: "토큰 검증 시도"
    })
    // JWT 토큰 검증
    const payload = JwtUtil.verifyToken({ token })
    if (!payload) {
      ContextLogger.warn({
        message: "토큰 검증 실패"
      })
      throw new AuthError.TokenVerificationFail()
    }
    ContextLogger.debug({
      message: `토큰 검증 성공: ${payload.email}`
    })
    return payload
  }
}
