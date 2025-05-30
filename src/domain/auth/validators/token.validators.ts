import { NextFunction, Response } from "express"
import { ErrorLayer, ValidatorError } from "../../../errors"
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
      throw ValidatorError.tokenRequired({ method: "validateToken", message: "Token이 없습니다" })
    }

    // 토큰 검증
    try {
      const payload = await tokenService.verifyToken({ token })
      // 요청 객체에 사용자 정보 추가
      req.user = {
        id: payload.id,
        email: payload.email,
      }
      next()
    } catch (error) {
      if (error instanceof Error && error.name === "TokenExpiredError") {
        throw ValidatorError.tokenExpired({
          method: "validateToken",
          message: "Token 만료됨",
        })
      }

      throw ValidatorError.tokenInvalid({
        method: "validateToken",
        message: "유효하지 않은 Token",
      })
    }
  } catch (error) {
    ContextLogger.debug({
      message: `Token 검증 - 오류 발생`,
      meta: {
        error: error instanceof Error ? error.message : String(error),
        path: req.path,
        method: req.method,
      },
    })

    // 에러 변환 및 전달
    if (error instanceof ValidatorError) {
      next(error)
    } else {
      next(
        ValidatorError.fromError<ValidatorError>(error, {
          method: "validateToken",
          message: "Token 검증 - 오류 발생",
          layer: ErrorLayer.MIDDLEWARE,
        })
      )
    }
    // // AppError는 ApiError로 변환하여 처리
    // if (error instanceof AppError) {
    //   next(error.toApiError())
    //   return
    // }

    // // 이미 ApiError인 경우 그대로 사용
    // if (error instanceof ApiError) {
    //   next(error)
    //   return
    // }

    // next(ApiError.internal({ message: "인증 처리 - 오류가 발생했습니다" }))
  }
}
