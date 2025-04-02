import { NextFunction, Request, Response } from "express"
import { ApiUtils } from "../../../utils/api/api.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { TokenResponseDTO } from "../dto/token.DTO"
import { TokenService } from "../services/token.service"
import { AuthError } from "../../../errors/domain-errors/AuthError"
import { handleControllerError } from "../../../errors/handler/integration-error-handler"

export class TokenController {
  private readonly tokenService: TokenService

  constructor({ tokenService }: { tokenService: TokenService }) {
    this.tokenService = tokenService
  }

  /**
   * token 발급
   */
  issueToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body
      ContextLogger.debug({ message: `Token 발급 요청 || email: ${email}` })

      // 서비스 호출
      const tokenData = await this.tokenService.createToken({
        input: { email, password },
      })

      // 출력 가공
      const tokenDTO = TokenResponseDTO.fromEntity({ tokenData })
      ContextLogger.info({ message: `사용자 ${email}에 대한 토큰 발급 성공` })

      ApiUtils.success({
        res,
        data: tokenDTO,
        statusCode: 201,
        message: "토큰이 성공적으로 발급되었습니다",
      })
    } catch (error) {
      return handleControllerError({
        next,
        error,
        logErrorMessage: "토큰 생성 중 TokenController.issueToken() 오류 발생",
        apiErrorMessage: "토큰 생성 중 오류가 발생했습니다",
        operation: "토큰 생성",
        // processingStage: "생성",
        errorCreator: (params) => new AuthError.DataProcessingError(params),
      })
    }
  }
}
