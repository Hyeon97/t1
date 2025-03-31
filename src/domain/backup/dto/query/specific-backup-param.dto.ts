/////////////////////////////////////////
//  특정 Backup data 조회 파라미터 DTO  //
/////////////////////////////////////////

import { IsNotEmpty, IsString } from "class-validator"

export class SpecificBackupParamDTO {
  @IsString()
  @IsNotEmpty({ message: "Backup 식별자는 필수입니다" })
  identifier!: string
}
