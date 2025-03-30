import { plainToInstance } from "class-transformer"
import { validate as classValidate, ValidationError } from "class-validator"
import { NextFunction, Request, Response } from "express"
import "reflect-metadata"
import { ApiError } from "../../errors/ApiError"
import { logger } from "../../utils/logger/logger.util"

/**
 * OOP 방식의 검증 미들웨어 클래스
 */
export class ValidationMiddleware {
  private validateDTO = <T extends object>(dtoClass: new () => T, options: { source?: "body" | "query" | "params"; whitelist?: boolean } = {}) => {
    const { source = "body", whitelist = true } = options

    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const data = req[source]

        // 요청 데이터를 DTO 클래스의 인스턴스로 변환
        const dtoInstance = plainToInstance(dtoClass, data, {
          enableImplicitConversion: true, // 문자열->숫자 등의 암시적 변환 허용
          exposeDefaultValues: true, // 기본값 노출
          excludeExtraneousValues: false, // 추가 값 제외 안함
          enableCircularCheck: false, // 순환 참조 체크 비활성화
        })

        // class-validator를 사용한 유효성 검사
        const errors = await classValidate(dtoInstance, {
          whitelist,
          forbidNonWhitelisted: true,
          skipMissingProperties: false,
          //  중첩
          validationError: {
            target: false,
            value: false,
          },
        })

        if (errors.length > 0) {
          // 재귀적으로 중첩된 에러 메시지를 포함하여 처리
          const errorMessages = this.extractValidationErrorMessages(errors)

          logger.warn(`[class-validator] 요청 유효성 검사 실패: ${errorMessages.join(", ")}`)
          throw ApiError.validationError({ message: "요청 데이터 유효성 검사 실패", details: errorMessages })
        }

        // 유효성 검사를 통과한 DTO 인스턴스로 요청 객체 업데이트
        req[source] = dtoInstance
        next()
      } catch (error) {
        if (error instanceof ApiError) {
          next(error)
        } else {
          logger.error("DTO 유효성 검사 중 오류 발생", error)
          next(ApiError.internal({ message: "서버 내부 오류 발생했습니다" }))
        }
      }
    }
  }

  // 재귀적으로 중첩된 유효성 검사 오류 메시지를 추출하는 헬퍼 메서드
  private extractValidationErrorMessages(errors: ValidationError[], prefix = ""): string[] {
    let messages: string[] = []

    for (const error of errors) {
      const property = prefix ? `${prefix}.${error.property}` : error.property

      // 현재 수준에서의 오류 메시지 추출
      if (error.constraints) {
        const constraintMessages = Object.values(error.constraints)
        messages = [...messages, ...constraintMessages]
      }

      // 중첩된 오류가 있는 경우 재귀적으로 처리
      if (error.children && error.children.length > 0) {
        const childMessages = this.extractValidationErrorMessages(error.children, property)
        messages = [...messages, ...childMessages]
      }
    }

    return messages
  }

  /**
   * 요청 본문(body)을 DTO 클래스로 변환하고 검증하는 미들웨어
   * @param dtoClass 검증에 사용할 DTO 클래스
   * @returns 미들웨어 함수
   */
  public validateBody(dtoClass: any) {
    return this.validateDTO(dtoClass, { source: "body" })
  }

  /**
   * URL 파라미터를 DTO 클래스로 변환하고 검증하는 미들웨어
   * @param dtoClass 검증에 사용할 DTO 클래스
   * @returns 미들웨어 함수
   */
  public validateParams(dtoClass: any) {
    return this.validateDTO(dtoClass, { source: "params" })
  }

  /**
   * 쿼리 파라미터를 DTO 클래스로 변환하고 검증하는 미들웨어
   * @param dtoClass 검증에 사용할 DTO 클래스
   * @returns 미들웨어 함수
   */
  public validateQuery(dtoClass: any) {
    return this.validateDTO(dtoClass, { source: "query" })
  }

  /**
   * 검증 오류 메시지 포맷팅
   * @param errors validation 오류 객체 배열
   * @returns 포맷팅된 오류 메시지 객체
   * @deprecated formatValidationErrors 함수를 직접 사용하세요
   */
  private static formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {}

    errors.forEach((error) => {
      const property = error.property
      const constraints = error.constraints || {}

      formattedErrors[property] = Object.values(constraints)
    })

    return formattedErrors
  }
}

export const validationMiddleware = new ValidationMiddleware()
