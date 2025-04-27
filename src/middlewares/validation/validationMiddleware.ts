import { plainToInstance } from "class-transformer"
import { validate as classValidate, ValidationError } from "class-validator"
import { NextFunction, Request, Response } from "express"
import "reflect-metadata"
import { ApiError, ValidatorError } from "../../errors"
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

        // console.log(`source: ${source}`)
        // console.log("data")
        // console.dir(data, { depth: null })

        // 요청 데이터를 DTO 클래스의 인스턴스로 변환
        const dtoInstance = plainToInstance(dtoClass, data, {
          enableImplicitConversion: true, // 문자열->숫자 등의 암시적 변환 허용
          exposeDefaultValues: true, // 기본값 노출
          // excludeExtraneousValues: false, // 추가 값 제외 안함 >> DTO를 아무리 설계해도 무시하고 진행됨
          excludeExtraneousValues: true, // 추가 값 제외 >> DTO에 @Expose()가 선언되어 있어야 정상적으로 파싱됨
          enableCircularCheck: false, // 순환 참조 체크 비활성화
        })

        // console.log("dtoInstance")
        // console.dir(dtoInstance, { depth: null })

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
          throw ValidatorError.validationError(ValidatorError, {
            method: "validateDTO",
            message: errorMessages.join("||"),
          })
        }

        // 유효성 검사를 통과한 DTO 인스턴스로 요청 객체 업데이트
        req[source] = dtoInstance
        next()
      } catch (error: any) {
        logger.error("DTO 유효성 검사 중 오류 발생", error)
        if (error instanceof ApiError || error instanceof ValidatorError) {
          next(error)
        } else {
          next(
            ValidatorError.internalError(ValidatorError, {
              method: "validateDTO",
              message: "서버 내부 오류 발생",
            })
          )
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
