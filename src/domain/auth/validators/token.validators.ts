import { NextFunction } from "express"
import { ApiError } from "../../../errors/ApiError"
import { TokenNotFoundError } from "../../../errors/domain-errors/AuthError"
import { validationMiddleware } from "../../../middlewares/validation/validationMiddleware"
import { ExtendedRequest } from "../../../types/common/req.types"
import { TokenIssueBodyDTO } from "../dto/token.DTO"
import { tokenService } from "../services/services"

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
      // throw AuthError.tokenRequired()
      throw new TokenNotFoundError()
    }

    // 토큰 검증
    const payload = await tokenService.verifyToken({ token })

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: payload.id,
      email: payload.email,
    }

    next()
  } catch (error) {
    if (error instanceof ApiError) next(error)
    next(ApiError.internal({ message: "인증 처리 중 오류 발생했습니다" }))
  }
}
