//////////////////////////////////////
//  특정 zdm data 조회 파라미터 DTO  //
//////////////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

export class SpecificZdmParamDTO {
  @IsString()
  @IsNotEmpty({ message: "ZDM 식별자는 필수입니다" })
  @Expose()
  identifier!: string
}
