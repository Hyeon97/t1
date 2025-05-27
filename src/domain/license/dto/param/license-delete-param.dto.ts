////////////////////////////////////
//  License data 삭제 파라미터 DTO  //
////////////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

/**
 * License ID로 삭제
 */
export class LicenseDeleteByLicenseIdParamDTO {
  //  License ID
  @IsNotEmpty({ message: "License ID는 필수입니다" })
  @IsNumber()
  @Expose()
  licenseId!: number
}

/**
 * License Key로 삭제
 */
export class LicenseDeleteByLicenseKeyParamDTO {
  //  License Key
  @IsNotEmpty({ message: "License Key는 필수입니다" })
  @IsString()
  @Expose()
  licenseKey!: string
}
