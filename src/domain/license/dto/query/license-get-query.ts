//////////////////////////////////////////
//  license data 조회 공통 필터링 옵션 DTO  //
//////////////////////////////////////////

import { Expose } from "class-transformer"
import { IsIn, IsOptional, Matches } from "class-validator"
import { VALID_LICENSE_TYPE_VALUES } from "../../../../types/common/const-value"
import { regDateFormatYYYYMMDD } from "../../../../utils/regex.utils"
import { LicenseType } from "../../types/license-common.type"
import { LicenseFilterOptions } from "../../types/license-get.type"

export class LicenseGetQueryDTO implements LicenseFilterOptions {
  //  필터 옵션
  @IsOptional()
  @IsIn(VALID_LICENSE_TYPE_VALUES, { message: `category는 ${VALID_LICENSE_TYPE_VALUES.join(', ')}만 가능합니다` })
  @Expose()
  category?: LicenseType

  @IsOptional()
  @Matches(regDateFormatYYYYMMDD, {
    message: 'exp는 YYYY-MM-DD 형식이어야 합니다 (예: 2024-12-31)'
  })
  @Expose()
  exp?: string //   ( 만료날, 년월일 포함 유무 )

  @IsOptional()
  @Matches(regDateFormatYYYYMMDD, {
    message: 'created는 YYYY-MM-DD 형식이어야 합니다 (예: 2024-12-31)'
  })
  @Expose()
  created?: string //   ( 생성일, 년원일 포함 유무 )
}