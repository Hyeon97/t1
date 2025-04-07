import { ServiceError } from "../../../errors/service/service-error"
import { BaseService } from "../../../utils/base/base-service"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { UserInfoRepository } from "../repositories/user-info.repository"
import { UserInfoTable } from "../types/db/user_info"

export class UserService extends BaseService {
  private readonly userInfoRepository: UserInfoRepository
  constructor({ userInfoRepository }: { userInfoRepository: UserInfoRepository }) {
    super({
      serviceName: "UserService",
    })
    this.userInfoRepository = userInfoRepository
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail({ email }: { email: string }): Promise<UserInfoTable> {
    try {
      ContextLogger.debug({ message: `이메일 ${email}로 사용자 조회` })
      const user = await this.userInfoRepository.findByEmail({ email })
      if (!user) {
        throw ServiceError.resourceNotFoundError({
          functionName: "getUserByEmail",
          message: `Mail이 '${email}'인 User를 찾을 수 없습니다`,
        })
      }
      return user
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getUserByEmail",
        message: `User 정보 조회 중 오류가 발생했습니다`,
      })
    }
  }
}
