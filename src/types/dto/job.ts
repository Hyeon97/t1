//////////////////////////////////
//  작업 관련 공통 사용 dto 정의  //
//////////////////////////////////

import { Expose, Transform } from "class-transformer"
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
import { VALID_REPOSITORY_VALUES } from "../common/const-value"
import { RepositoryBody, RepositoryType } from "../common/repository"

/**
 * 작업 등록시 repository 입력 양식
 */
export class JobRegistRepositoryDTO implements RepositoryBody {
  @IsNotEmpty({ message: "repository.id가 누락되었습니다" })
  @IsNumber({}, { message: "repository.id는 숫자만 가능 합니다" })
  @Expose()
  id!: number

  @IsOptional()
  @IsNotEmpty({ message: "repository.type이 누락되었습니다" })
  @IsIn(VALID_REPOSITORY_VALUES, {
    message: `repository.type은 ${VALID_REPOSITORY_VALUES.join(", ")}중 하나여야 합니다`,
  })
  @Expose()
  type?: RepositoryType

  @IsOptional()
  @IsString({ message: "repository.path는 문자열이어야 합니다" })
  @Expose()
  path?: string
}

/**
 * 작업 수정시 repository 입력 양식
 */
export class JobEditRepositoryDTO implements RepositoryBody {
  @IsOptional()
  @IsNumber({}, { message: "repository.id는 숫자만 가능 합니다" })
  @Transform(({ value }) => value === undefined ? undefined :
    (typeof value === 'string' ? parseInt(value, 10) : value))
  @Expose()
  id?: number


  @IsOptional()
  @IsIn(VALID_REPOSITORY_VALUES, {
    message: `repository.type은 ${VALID_REPOSITORY_VALUES.join(", ")}중 하나여야 합니다`,
  })
  @Expose()
  type?: RepositoryType

  @IsOptional()
  @IsString({ message: "repository.path는 문자열이어야 합니다" })
  @Expose()
  path?: string
}

