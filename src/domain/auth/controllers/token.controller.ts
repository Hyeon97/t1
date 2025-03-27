import { NextFunction, Request, Response } from "express"
import { ApiError } from "../../../errors/ApiError"
import { ApiUtils } from "../../../utils/api/api.utils"
import { logger } from "../../../utils/logger/logger.util"
import { TokenResponseDTO } from "../dto/token.DTO"
import { TokenService } from "../services/token.service"

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
      logger.debug(`Token 발급 요청 || email: ${email}`)

      // 서비스 호출
      const tokenData = await this.tokenService.createToken({
        input: { email, password },
      })

      // 출력 가공
      const tokenDTO = TokenResponseDTO.fromEntity({ tokenData })

      ApiUtils.success({
        res,
        data: tokenDTO,
        statusCode: 201,
        message: "토큰이 성공적으로 발급되었습니다",
      })
    } catch (error) {
      if (error instanceof ApiError) {
        next(error)
        return
      }
      next(ApiError.internal({ message: "토큰 발급 처리 중 오류가 발생했습니다" }))
    }
  }
}
