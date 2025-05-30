import { ServiceError } from "../../../errors/service/service-error"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { JwtUtil } from "../../../utils/jwt.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { UserInfoRepository } from "../../user/repositories/user-info.repository"
import { UserTokenRepository } from "../../user/repositories/user-token.repository"
import { TokenIssueBodyDTO } from "../dto/token.DTO"
import { CreateTokenData, TokenDBInput, TokenVerifySuccessResult } from "../interface/token"

export class TokenService extends BaseService {
  private readonly userInfoRepository: UserInfoRepository
  private readonly userTokenRepository: UserTokenRepository
  constructor({ userInfoRepository, userTokenRepository }: { userInfoRepository: UserInfoRepository; userTokenRepository: UserTokenRepository }) {
    super({
      serviceName: "TokenService",
    })
    this.userInfoRepository = userInfoRepository
    this.userTokenRepository = userTokenRepository
  }

  /**
   * token 생성
   */
  async createToken({ input }: { input: TokenIssueBodyDTO }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createToken", state: "start" })
      ContextLogger.debug({ message: `토큰 생성 시작 - 이메일: ${input.email}` })
      //  사용자 조회
      const user = await this.userInfoRepository.findByEmail({ email: input.email })
      //  추후 아래 로직으로 변경
      // const user = await this.userInfoRepository.findByEmailAndPassword({ email: input.email, password: input.password })
      // if (!user) {
      if (!user) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "createToken",
          message: `Mail이 '${input.email}'인 User를 찾을 수 없습니다`,
        })
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
        sToken: token,
        sMail: input.email,
        sIssue_Date: "",
        sLast_Use_Date: "",
      }
      this.executeTransaction({
        callback: async (transaction) => {
          return this.userTokenRepository.saveTokenInfo({ saveData, transaction })
        },
      })
      ContextLogger.debug({
        message: `사용자 ${input.email}의 Token이 생성되었습니다`,
        meta: { expiresAt },
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createToken", state: "end" })
      return { token, expiresAt }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "createToken",
        message: `[Token 생성] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * token 검증
   */
  async verifyToken({ token }: { token: string }): Promise<TokenVerifySuccessResult> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "verifyToken", state: "start" })
      ContextLogger.debug({ message: "토큰 검증 시작" })

      // JWT 토큰 검증
      const payload = JwtUtil.verifyToken({ token })

      ContextLogger.debug({ message: `토큰 검증 성공 || User: ${payload.email}` })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "verifyToken", state: "end" })
      return payload
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "verifyToken",
        message: `[토큰 검증] - 오류가 발생했습니다`,
      })
    }
  }
}
