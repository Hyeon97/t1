///////////////////////////////
//  Backup 작업 등록 Body DTO //
///////////////////////////////

import { Transform, Type } from "class-transformer"
import { IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, Validate, ValidateIf, ValidateNested } from "class-validator"
import { VALID_COMPRESSION_VALUES, VALID_ENCRYPTION_VALUES, VALID_JOB_AUTOSTART_VALUES, VALID_JOB_TYPE_VALUES, VALID_REPOSITORY_VALUES } from "../../../../types/common/const-value"
import { RepositoryType } from "../../../../types/common/repository"
import { stringToNumber } from "../../../../utils/data-convert.util"
import { IsEmailOrNumberConstraint } from "../../../../utils/dto.utils"
import { BackupType } from "../../types/backup-common.type"
import { BackupRegistRequestBody } from "../../types/backup-regist.type"


/**
 * 중첩 검증을 위한 별도 클래스
 */
class RepositoryDto {
  @IsNotEmpty({ message: "repository.id가 누락되었습니다" })
  @IsNumber({}, { message: "repository.id는 숫자만 가능 합니다" })
  id!: number

  @IsNotEmpty({ message: "repository.type이 누락되었습니다" })
  @IsIn(VALID_REPOSITORY_VALUES, {
    message: `repository.type은 ${VALID_REPOSITORY_VALUES.join(", ")} 중 하나여야 합니다`,
  })
  type!: RepositoryType

  @IsOptional()
  @IsString({ message: "repository.path는 문자열이어야 합니다" })
  path?: string = ""
}

/**
 * Backup data 등록 DTO
 */
export class BackupRegistBodyDTO implements BackupRegistRequestBody {
  //  필수
  @IsNotEmpty({ message: "center가 누락되었습니다" })
  @Transform(stringToNumber)
  center!: number | string //  number: 센터 ID, string: 센터 name

  @IsNotEmpty({ message: "server가 누락되었습니다" })
  @Transform(stringToNumber)
  server!: number | string //  number: 작업 서버 ID, string: 작업 서버 name

  @IsNotEmpty({ message: "type이 누락되었습니다" })
  @IsIn(VALID_JOB_TYPE_VALUES, {
    message: `type은 ${VALID_JOB_TYPE_VALUES.join(", ")} 중 하나여야 합니다`,
  })
  type!: BackupType //  작업 타입

  @IsNotEmpty({ message: "partition이 누락되었습니다" })
  @IsArray({ message: "partition은 배열이어야 합니다 (전체 작업 등록시에는 빈 배열 선언 [])" })
  partition!: string[] // 작업 파티션

  //  작업 사용 레포지토리
  @ValidateNested({ message: "repository 객체의 형식이 올바르지 않습니다" })
  @Type(() => RepositoryDto)
  @IsNotEmpty({ message: "repository가 누락되었습니다" })
  repository!: RepositoryDto

  //  선택
  @IsOptional()
  jobName?: string = "" //  작업 이름

  @IsOptional()
  @Transform(stringToNumber)
  @Validate(IsEmailOrNumberConstraint)
  user?: string | number = "" //  number: user ID, string: user mail

  @IsOptional()
  schedule?: {
    full?: number //  등록시에는 zdm에 등록된 schedule ID
    inc?: number //  등록시에는 zdm에 등록된 schedule ID
  } = { full: 0, inc: 0 }

  @IsOptional()
  descroption?: string = "" //  추가 설명

  @IsOptional()
  @IsInt({ message: "rotation은 정수여야 합니다" })
  @Min(1, { message: "rotation은 1 이상이어야 합니다" })
  @Max(30, { message: "rotation은 30 이하여야 합니다" })
  rotation?: number = 1 //  작업 반복 횟수

  @IsOptional()
  @IsIn(VALID_COMPRESSION_VALUES, { message: `compression ${VALID_COMPRESSION_VALUES.join(", ")} 만 가능합니다` })
  compression?: string = "use" //  작업시 압축 여부

  @IsOptional()
  @IsIn(VALID_ENCRYPTION_VALUES, { message: `encryption은 ${VALID_ENCRYPTION_VALUES.join(", ")} 만 가능합니다` })
  encryption?: string = "not use" // 작업시 암호화 여부

  @IsOptional()
  excludeDir?: string = "" //  작업 제외 디렉토리

  @IsOptional()
  @ValidateIf((o) => o.mail_event !== undefined && o.mail_event.trim() !== "")
  @IsEmail({}, { message: "유효한 이메일 형식이 아닙니다" })
  mail_event?: string = "" //  작업 이벤트 수신 mail

  @IsOptional()
  @Type(() => Number) // 문자열을 숫자로 변환
  @IsInt({ message: "네트워크 제한 속도는 정수여야 합니다" })
  @Min(0, { message: "네트워크 제한 속도는 0 이상이어야 합니다" })
  networkLimit?: number = 0 //  작업 네트워크 제한 속도

  @IsOptional()
  @IsIn(VALID_JOB_AUTOSTART_VALUES, { message: `autoStart은 ${VALID_JOB_AUTOSTART_VALUES.join(", ")} 만 가능합니다` })
  autoStart?: string = "not use" //  자동 시작 여부
}