//////////////////////////////////////
//  DTO 에서 사용할 여러 검증 함수들  //
//////////////////////////////////////

import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"
import { regCommonEmail } from "./regex.utils"

/**
 * 사용자 ID or 사용자 Mail 검증
 */
@ValidatorConstraint({ name: "isEmailOrNumber", async: false })
export class IsEmailOrNumberConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // 값이 없으면 통과 (옵셔널 필드임)
    if (value === undefined || value === null || value === "") {
      return true
    }

    // 숫자인 경우 통과
    if (typeof value === "number") {
      return true
    }

    // 문자열인 경우 이메일 형식 검증
    if (typeof value === "string") {
      // 간단한 이메일 정규식
      return regCommonEmail.test(value)
    }

    return false
  }
  defaultMessage(args: ValidationArguments) {
    const value = args.value
    if (typeof value === "string" && regCommonEmail.test(value)) {
      return "유효한 이메일 형식이 아닙니다"
    } else {
      return "user는 이메일 또는 숫자여야 합니다"
    }
  }
}