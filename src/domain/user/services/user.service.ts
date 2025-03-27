import { UserNotFoundError } from "../../../errors/domain-errors/UserError"
import { logger } from "../../../utils/logger/logger.util"
import { UserInfoTable } from "../interface/db/user_info"
import { UserInfoRepository } from "../repositories/user-info.repository"

export class UserService {
  private readonly userInfoRepository: UserInfoRepository
  constructor({ userInfoRepository }: { userInfoRepository: UserInfoRepository }) {
    this.userInfoRepository = userInfoRepository
  }
  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail({ email }: { email: string }): Promise<UserInfoTable> {
    try {
      logger.debug(`이메일 ${email}로 사용자 조회 시도`)
      const user = await this.userInfoRepository.findByEmail({ email })
      if (!user) {
        throw new UserNotFoundError({ user: email, type: "Email" })
      }
      return user
    } catch (error) {
      logger.error(`사용자 조회 중 오류 발생`)
      throw error
    }
  }
}
