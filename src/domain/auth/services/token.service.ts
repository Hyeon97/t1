import { ApiError } from "../../../errors/ApiError"
import { TokenVerificationError } from "../../../errors/domain-errors/AuthError"
import { UserNotFoundError } from "../../../errors/domain-errors/UserError"
import { JwtUtil } from "../../../utils/jwt.utils"
import { logger } from "../../../utils/logger/logger.util"
import { UserInfoRepository } from "../../user/repositories/user-info.repository"
import { UserTokenRepository } from "../../user/repositories/user-token.repository"
import { TokenIssueBodyDTO } from "../dto/token.DTO"
import { CreateTokenData, TokenDBInput, ToKenVerifiSuccessResult } from "../interface/token"

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
      logger.debug(`토큰 생성 시작\n${input}`)
      //  사용자 조회
      const user = await this.userInfoRepository.findByEmailAndPassword({ email: input.email, password: input.password })
      if (!user) {
        throw new UserNotFoundError({ user: input.email, type: "Email" })
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

      return { token, expiresAt }
    } catch (error) {
      if (error instanceof ApiError) throw error
      logger.error("토큰 생성 중 오류 발생", error)
      throw ApiError
    }
  }

  /**
   * token 검증
   */
  async verifyToken({ token }: { token: string }): Promise<ToKenVerifiSuccessResult> {
    // JWT 토큰 검증
    const payload = JwtUtil.verifyToken({ token })
    if (!payload) {
      throw new TokenVerificationError()
    }

    return payload
  }
}
