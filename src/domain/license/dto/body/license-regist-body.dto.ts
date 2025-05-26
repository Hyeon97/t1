////////////////////////////
//  license 등록 Body DTO  //
////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsOptional } from "class-validator"
import { LicenseRegistRequestBody } from "../../types/license-regist.type"

/**
 * License 등록 Body DTO
 */
export class LicenseRegistBodyDTO implements LicenseRegistRequestBody {
  //  필수
  @IsNotEmpty({ message: 'center는 필수 입력 항목입니다' })
  @Expose()
  center!: string

  @IsNotEmpty({ message: 'key는 필수 입력 항목입니다' })
  @Expose()
  key!: string

  @IsNotEmpty({ message: 'centerUUID는 필수 입력 항목입니다' })
  @Expose()
  centerUUID!: string

  //  선택
  @IsOptional()
  @Expose()
  name?: string

  @IsOptional()
  @Expose()
  desc?: string
}