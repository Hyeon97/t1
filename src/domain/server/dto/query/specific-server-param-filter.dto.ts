/////////////////////////////////////////
//  특정 server data 조회 파라미터 DTO  //
/////////////////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

export class SpecificServerParamDTO {
  @IsString()
  @IsNotEmpty({ message: "Server 식별자는 필수입니다" })
  @Expose()
  identifier!: string
}
