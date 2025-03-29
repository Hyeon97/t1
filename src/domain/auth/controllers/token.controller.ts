import { NextFunction, Request, Response } from "express"
import { ApiError } from "../../../errors/ApiError"
import { AppError } from "../../../errors/AppError"
import { ApiUtils } from "../../../utils/api/api.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { TokenResponseDTO } from "../dto/token.DTO"
import { TokenService } from "../services/token.service"
import { asyncLocalStorage } from "../../../utils/asyncContext"

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
      ContextLogger.error({
        message: `토큰 발급 처리 중 오류: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error : undefined,
      })
      // AppError는 toApiError로 변환하여 처리 (한 번의 체크로 모든 도메인 에러 처리)
      if (error instanceof AppError) {
        next(error.toApiError())
        return
      }

      // 이미 ApiError인 경우
      if (error instanceof ApiError) {
        next(error)
        return
      }

      // 기타 예상치 못한 에러
      next(
        ApiError.internal({
          message: "토큰 발급 처리 중 예기치 않은 오류가 발생했습니다",
          details: process.env.NODE_ENV !== "production" ? { error: error instanceof Error ? error.message : String(error) } : undefined,
        })
      )
    }
  }
}
