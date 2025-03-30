import { NextFunction, Request, Response } from "express"
import { ApiError } from "../../../errors/ApiError"
import { AppError } from "../../../errors/AppError"
import { AuthError } from "../../../errors/domain-errors/AuthError"
import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { ExtendedRequest } from "../../../types/common/req.types"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { TokenIssueBodyDTO } from "../dto/token.DTO"
import { tokenService } from "../services/service-registry"

/**
 * 토큰 발급요청 body 검증
 */
export const validateTokenIssueBody = validationMiddleware.validateBody(TokenIssueBodyDTO)

/**
 * 헤더에 있는 토큰 검증
 */
export const validateToken = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Authorization 헤더에서 토큰 추출
    const token = req.headers.authorization
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (!token) {
      throw new AuthError.TokenNotFound()
    }

    // 토큰 검증
    const payload = await tokenService.verifyToken({ token })

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: payload.id,
      email: payload.email,
    }
    ContextLogger.debug({ message: `인증 성공: ${payload.email}` })
    next()
  } catch (error) {
    ContextLogger.error({ message: `인증 처리 중 오류: ${error instanceof Error ? error.message : "Unknown error"}` })

    // AppError는 ApiError로 변환하여 처리
    if (error instanceof AppError) {
      next(error.toApiError())
      return
    }

    // 이미 ApiError인 경우 그대로 사용
    if (error instanceof ApiError) {
      next(error)
      return
    }

    next(ApiError.internal({ message: "인증 처리 중 오류가 발생했습니다" }))
  }
}
