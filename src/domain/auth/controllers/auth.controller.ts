import { Request, Response, NextFunction } from "express"
import { ApiError } from "../../../errors/ApiError"
import { logger } from "../../../utils/logger/logger.util"
import { ApiUtils } from "../../../utils/api/api.utils"
import { TokenResponseDTO } from "../dto/token.DTO"
import { tokenService } from "../services/services"

export class AuthController {
  /**
   * token 발급
   */
  issueToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body
      logger.debug(`Token 발급 요청 || email: ${email}, password: ${password}`)
      // 서비스 호출
      const tokenData = await tokenService.createToken({ input: { email, password } })
      //  출력 가공
      const tokenDTO = TokenResponseDTO.fromEntity({
        tokenData,
      })
      ApiUtils.success({ res, data: tokenDTO, statusCode: 201, message: "token issue result" })
    } catch (error) {
      if (error instanceof ApiError) next(error)
      next(ApiError.internal({ message: "토큰 발급 처리 중 오류 발생했습니다" }))
    }
  }
}
