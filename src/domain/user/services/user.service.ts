import { ServiceError } from "../../../errors/service/service-error"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
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
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getUserByEmail", state: "start" })

      const user = await this.userInfoRepository.findByEmail({ email })
      if (!user) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "getUserByEmail",
          message: `Mail이 '${email}'인 User를 찾을 수 없습니다`,
        })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getUserByEmail", state: "end" })
      return user
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getUserByEmail",
        message: `[User 정보 조회] - 오류가 발생했습니다`,
      })
    }
  }
}
