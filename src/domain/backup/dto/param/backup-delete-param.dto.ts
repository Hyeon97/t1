///////////////////////////////////
//  Backup data 삭제 파라미터 DTO  //
///////////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

/**
 * 작업 이름으로 삭제
 */
export class BackupDeleteByJobNameParamDTO {
  //  작업 이름
  @IsNotEmpty({ message: "작업 이름은 필수입니다" })
  @IsString()
  @Expose()
  jobName!: string
}

/**
 * 작업 ID로 삭제
 */
export class BackupDeleteByJobIdParamDTO {
  //  작업 ID
  @IsNotEmpty({ message: "작업 ID는 필수입니다" })
  @IsNumber()
  @Expose()
  jobId!: number
}

/**
 * 작업 대상 server 이름으로 삭제
 */
export class BackupDeleteByServerNameParamDTO {
  //  작업 대상 서버 이름
  @IsNotEmpty({ message: "서버 이름은 필수입니다" })
  @IsString()
  @Expose()
  serverName!: string
}
