////////////////////////////////////
//  Backup data 조회 파라미터 DTO  //
////////////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

/**
 * 작업 이름으로 모니터링
 */
export class BackupGetByJobNameParamDTO {
  //  작업 이름
  @IsNotEmpty({ message: "작업 이름은 필수입니다" })
  @IsString()
  @Expose()
  jobName!: string
}

/**
 * 작업 ID로 모니터링
 */
export class BackupGetByJobIdParamDTO {
  //  작업 ID
  @IsNotEmpty({ message: "작업 ID는 필수입니다" })
  @IsNumber()
  @Expose()
  jobId!: number
}

/**
 * 작업 대상 server 이름으로 모니터링
 */
export class BackupGetByServerNameParamDTO {
  //  작업 대상 서버 이름
  @IsNotEmpty({ message: "서버 이름은 필수입니다" })
  @IsString()
  @Expose()
  serverName!: string
}
