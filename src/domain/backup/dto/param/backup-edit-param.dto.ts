////////////////////////////////////
//  Backup data 수정 파라미터 DTO  //
////////////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

/**
 * 작업 이름으로 수정
 */
export class BackupEditByJobNameParamDTO {
  //  작업 이름
  @IsNotEmpty({ message: "작업 이름은 필수입니다" })
  @IsString()
  @Expose()
  jobName!: string
}

/**
 * 작업 ID로 수정
 */
export class BackupEditByJobIdParamDTO {
  //  작업 ID
  @IsNotEmpty({ message: "작업 ID는 필수입니다" })
  @IsNumber()
  @Expose()
  jobId!: number
}

/**
 * 작업 대상 server 이름으로 수정
 */
export class BackupEditByServerNameParamDTO {
  //  작업 대상 서버 이름
  @IsNotEmpty({ message: "서버 이름은 필수입니다" })
  @IsString()
  @Expose()
  serverName!: string
}
