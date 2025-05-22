////////////////////////////
//  license 할당 Body DTO  //
////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"
import { LicenseAssignRequestBody } from "../../types/license-assign.type"

/**
 * License 할당 Body DTO
 */
export class LicenseAssignBodyDTO implements LicenseAssignRequestBody {
  @IsNotEmpty({ message: 'server는 필수 입력 항목입니다' })
  @IsString({ message: 'server는 문자열이어야 합니다' })
  @Expose()
  server!: string //  license 할당할 server 이름 or id (숫자만 있는 경우)

  @IsNotEmpty({ message: 'license는 필수 입력 항목입니다' })
  @IsString({ message: 'license는 문자열이어야 합니다' })
  @Expose()
  license!: string //  할당할 license 이름 or id (숫자만 있는 경우)
}