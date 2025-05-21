//////////////////////////////////////////
//  licnse data 조회 공통 필터링 옵션 DTO  //
//////////////////////////////////////////

import { LicenseType } from "../../types/license-common.type"
import { LicenseFilterOptions } from "../../types/license-get.type"

export class LicenseGetQueryDTO implements LicenseFilterOptions {
  //  필터 옵션
  category?: LicenseType
  exp?: string //   ( 만료날, 년월일 포함 유무 )
  created?: string //   ( 생성일, 년원일 포함 유무 )
}