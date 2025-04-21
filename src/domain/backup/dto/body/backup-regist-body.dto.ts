///////////////////////////////
//  Backup 작업 등록 Body DTO //
///////////////////////////////

import { Expose, Transform, Type } from "class-transformer"
import { IsArray, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, Max, Min, Validate, ValidateIf, ValidateNested } from "class-validator"
import { CompressionType } from "../../../../types/common/compression"
import {
  VALID_COMPRESSION_VALUES,
  VALID_ENCRYPTION_VALUES,
  VALID_JOB_AUTOSTART_VALUES,
  VALID_JOB_TYPE_VALUES,
} from "../../../../types/common/const-value"
import { EncryptionType } from "../../../../types/common/encryption"
import { AutoStartType } from "../../../../types/common/job"
import { stringToNumber } from "../../../../utils/data-convert.utils"
import { IsEmailOrNumberConstraint } from "../../../../utils/dto.utils"
import { BackupType } from "../../types/backup-common.type"
import { BackupRegistRequestBody } from "../../types/backup-regist.type"
import { RepositoryDTO } from "../../../../types/dto/job"

/**
 * Backup data 등록 DTO
 */
export class BackupRegistBodyDTO implements BackupRegistRequestBody {
  //  필수
  @IsNotEmpty({ message: "center가 누락되었습니다" })
  @Transform(stringToNumber)
  @Expose()
  center!: number | string //  number: 센터 ID, string: 센터 name

  @IsNotEmpty({ message: "server가 누락되었습니다" })
  @Transform(stringToNumber)
  @Expose()
  server!: number | string //  number: 작업 서버 ID, string: 작업 서버 name

  @IsNotEmpty({ message: "type이 누락되었습니다" })
  @IsIn(VALID_JOB_TYPE_VALUES, {
    message: `type은 ${VALID_JOB_TYPE_VALUES.join(", ")}중 하나여야 합니다`,
  })
  @Expose()
  type!: BackupType //  작업 타입

  @IsNotEmpty({ message: "partition이 누락되었습니다" })
  @IsArray({ message: "partition은 배열이어야 합니다 (전체 작업 등록시에는 빈 배열 선언 [])" })
  @Expose()
  partition!: string[] // 작업 파티션

  //  작업 사용 레포지토리
  @ValidateNested({ message: "repository 객체의 형식이 올바르지 않습니다" })
  @Type(() => RepositoryDTO)
  @IsNotEmpty({ message: "repository가 누락되었습니다" })
  @Expose()
  repository!: RepositoryDTO

  //  선택
  @IsOptional()
  @Expose()
  jobName?: string = "" //  작업 이름

  @IsOptional()
  @Transform(stringToNumber)
  @Validate(IsEmailOrNumberConstraint)
  @Expose()
  user?: string | number = "" //  number: user ID, string: user mail

  @IsOptional()
  @Expose()
  schedule?: {
    full?: number //  등록시에는 zdm에 등록된 schedule ID
    inc?: number //  등록시에는 zdm에 등록된 schedule ID
  } = { full: 0, inc: 0 }

  @IsOptional()
  @Expose()
  descroption?: string = "" //  추가 설명

  @IsOptional()
  @IsInt({ message: "rotation은 정수여야 합니다" })
  @Min(1, { message: "rotation은 1 이상이어야 합니다" })
  @Max(30, { message: "rotation은 30 이하여야 합니다" })
  @Expose()
  rotation?: number = 1 //  작업 반복 횟수

  @IsOptional()
  @IsIn(VALID_COMPRESSION_VALUES, { message: `compression ${VALID_COMPRESSION_VALUES.join(", ")} 만 가능합니다` })
  @Expose()
  compression?: CompressionType = "use" //  작업시 압축 여부

  @IsOptional()
  @IsIn(VALID_ENCRYPTION_VALUES, { message: `encryption은 ${VALID_ENCRYPTION_VALUES.join(", ")} 만 가능합니다` })
  @Expose()
  encryption?: EncryptionType = "not use" // 작업시 암호화 여부

  @IsOptional()
  @Expose()
  excludeDir?: string = "" //  작업 제외 디렉토리

  @IsOptional()
  @Expose()
  excludePartition?: string = "" //  작업 제외 파티션

  @IsOptional()
  @ValidateIf((o) => o.mailEvent !== undefined && o.mailEvent.trim() !== "")
  @IsEmail({}, { message: "유효한 이메일 형식이 아닙니다" })
  @Expose()
  mailEvent?: string = "" //  작업 이벤트 수신 mail

  @IsOptional()
  @Type(() => Number) // 문자열을 숫자로 변환
  @IsInt({ message: "네트워크 제한 속도는 정수여야 합니다" })
  @Min(0, { message: "네트워크 제한 속도는 0 이상이어야 합니다" })
  @Expose()
  networkLimit?: number = 0 //  작업 네트워크 제한 속도

  @IsOptional()
  @IsIn(VALID_JOB_AUTOSTART_VALUES, { message: `autoStart은 ${VALID_JOB_AUTOSTART_VALUES.join(", ")} 만 가능합니다` })
  @Expose()
  autoStart?: AutoStartType = "not use" //  자동 시작 여부
}
