////////////////////////////////////
//  Backup data 조회 파라미터 DTO  //
////////////////////////////////////

import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class SpecificBackupGetParamDTO {
  @IsString()
  @IsNotEmpty({ message: "Backup 식별자는 필수입니다" })
  identifier!: string
}

/**
 * 작업 이름으로 모니터링
 */
export class BackupGetByJobNameParamDTO {
  //  필터 옵션
  //  작업 이름
  @IsNotEmpty({ message: "작업 이름은 필수입니다" })
  @IsString()
  jobName!: string
}

/**
 * 작업 ID로 모니터링
 */
export class BackupGetByJobIdParamDTO {
  //  필터 옵션
  //  작업 ID
  @IsNotEmpty({ message: "작업 ID는 필수입니다" })
  @IsNumber()
  jobId!: number
}

/**
 * 작업 대상 server 이름으로 모니터링
 */
export class BackupGetByServerNameParamDTO {
  //  필터 옵션
  //  작업 대상 서버 이름
  @IsNotEmpty({ message: "서버 이름은 필수입니다" })
  @IsString()
  serverName!: string
}
