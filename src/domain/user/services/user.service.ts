import { UserError } from "../../../errors/domain-errors/UserError"
import { handleServiceError } from "../../../errors/handler/integration-error-handler"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { UserInfoRepository } from "../repositories/user-info.repository"
import { UserInfoTable } from "../types/db/user_info"

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
      ContextLogger.debug({ message: `이메일 ${email}로 사용자 조회` })
      const user = await this.userInfoRepository.findByEmail({ email })
      if (!user) {
        throw new UserError.UserNotFound({ user: email, type: "Email" })
      }
      return user
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "User 정보 조회중 UserService.getUserByEmail() 에러 발생",
        apiErrorMessage: "User 정보 조회 중 오류가 발생했습니다",
        operation: "User 정보 조회",
        // processingStage: "조회",
        errorCreator: (params) => new UserError.DataProcessingError(params),
      })
    }
  }
}
