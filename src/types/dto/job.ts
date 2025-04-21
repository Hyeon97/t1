//////////////////////////////////
//  작업 관련 공통 사용 dto 정의  //
//////////////////////////////////

import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { VALID_REPOSITORY_VALUES } from "../common/const-value"
import { RepositoryType } from "../common/repository"
import { Expose } from "class-transformer"

/**
 * 작업 등록, 수정시 repository 입력 양식
 */
export class RepositoryDTO {
  @IsNotEmpty({ message: "repository.id가 누락되었습니다" })
  @IsNumber({}, { message: "repository.id는 숫자만 가능 합니다" })
  @Expose()
  id!: number

  @IsNotEmpty({ message: "repository.type이 누락되었습니다" })
  @IsIn(VALID_REPOSITORY_VALUES, {
    message: `repository.type은 ${VALID_REPOSITORY_VALUES.join(", ")}중 하나여야 합니다`,
  })
  @Expose()
  type!: RepositoryType

  @IsOptional()
  @IsString({ message: "repository.path는 문자열이어야 합니다" })
  @Expose()
  path?: string = ""
}
