import { NextFunction, Request, Response } from "express"
import { ApiUtils } from "../../../utils/api/api.utils"
import { BaseController } from "../../../utils/base/base-controller"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { TokenResponseDTO } from "../dto/token.DTO"
import { TokenService } from "../services/token.service"

export class TokenController extends BaseController {
  private readonly tokenService: TokenService

  constructor({ tokenService }: { tokenService: TokenService }) {
    super({
      controllerName: "TokenController",
    })
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
      ContextLogger.info({ message: `사용자 ${email}에 대한 Token 발급 성공` })

      ApiUtils.success({
        res,
        data: tokenDTO,
        statusCode: 201,
        message: "Token이 성공적으로 발급되었습니다",
      })
    } catch (error) {
      this.handleControllerError({
        next,
        error,
        method: "issueToken",
        message: "Token 생성 중 오류가 발생했습니다",
      })
    }
  }
}
