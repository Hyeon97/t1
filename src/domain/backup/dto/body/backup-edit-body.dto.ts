///////////////////////////////
//  Backup 작업 수정 Body DTO //
///////////////////////////////

import { Expose, Type } from "class-transformer"
import { IsIn, IsInt, IsOptional, Min, ValidateNested } from "class-validator"
import { CompressionType } from "../../../../types/common/compression"
import { VALID_COMPRESSION_VALUES, VALID_ENCRYPTION_VALUES, VALID_JOB_TYPE_VALUES } from "../../../../types/common/const-value"
import { EncryptionType } from "../../../../types/common/encryption"
import { JobStatusType } from "../../../../types/common/job"
import { JobEditRepositoryDTO } from "../../../../types/dto/job"
import { BackupType } from "../../types/backup-common.type"
import { BackupEditRequestBody } from "../../types/backup-edit.type"

/**
 * Backup data 수정 DTO
 */
export class BackupEditBodyDTO implements BackupEditRequestBody {
  /**
   * 작업 대상 파티션
   * - 서버 이름으로 수정시 사용
   * - 서버 이름으로 작업 수정하는 경우에는 해당 서버의 최신 작업 한 세트를 모두 수정,
   *   이때 해당 값이 있는경우 해당 값과 일치하는 파티션을 가진 작업만 수정
   */
  @IsOptional()
  @Expose()
  partition?: string[]

  //  변경할 작업 이름
  @IsOptional()
  @Expose()
  changeName?: string

  //  작업 타입
  @IsOptional()
  @IsIn(VALID_JOB_TYPE_VALUES, {
    message: `type은 ${VALID_JOB_TYPE_VALUES.join(", ")}중 하나여야 합니다`,
  })
  @Expose()
  type?: BackupType

  //  작업 상태
  @IsOptional()
  @Expose()
  status?: JobStatusType

  //  추가 설명
  @IsOptional()
  @Expose()
  description?: string

  //  작업 반복 횟수
  @IsOptional()
  @Expose()
  rotation?: number

  //  작업 압축 여부
  @IsOptional()
  @IsIn(VALID_COMPRESSION_VALUES, { message: `compression ${VALID_COMPRESSION_VALUES.join(", ")} 만 가능합니다` })
  @Expose()
  compression?: CompressionType

  // 작업 암호화 여부
  @IsOptional()
  @IsIn(VALID_ENCRYPTION_VALUES, { message: `encryption은 ${VALID_ENCRYPTION_VALUES.join(", ")} 만 가능합니다` })
  @Expose()
  encryption?: EncryptionType

  //  작업 제외 디렉토리
  @IsOptional()
  @Expose()
  excludeDir?: string

  //  작업 이벤트 수신 mail
  @IsOptional()
  @Expose()
  mailEvent?: string

  //  작업 네트워크 제한 속도
  @IsOptional()
  @Type(() => Number) // 문자열을 숫자로 변환
  @IsInt({ message: "네트워크 제한 속도는 정수여야 합니다" })
  @Min(0, { message: "네트워크 제한 속도는 0 이상이어야 합니다" })
  @Expose()
  networkLimit?: number

  //  작업 스케쥴
  @IsOptional()
  @Expose()
  schedule?: {
    full?: string //  숫자만 있는 경우 zdm에 등록된 schedule ID | 그외 : 신규 스케쥴 등록 후 적용
    inc?: string //  숫자만 있는 경우 zdm에 등록된 schedule ID | 그외 : 신규 스케쥴 등록 후 적용
  }

  //  작업 사용 레포지토리
  @IsOptional()
  @ValidateNested({ message: "repository 객체의 형식이 올바르지 않습니다" })
  @Type(() => JobEditRepositoryDTO)
  @Expose()
  repository?: JobEditRepositoryDTO
}
