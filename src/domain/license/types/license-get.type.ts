///////////////////////////////////////
//  License 조회 필터링 옵션 인터페이스  //
///////////////////////////////////////

import { LicenseType } from "./license-common.type"

/**
 * License 조회 필터링 옵션
 */
export interface LicenseFilterOptions {
  //  필터 옵션
  category?: LicenseType
  exp?: string  //   ( 만료날, 년월일 포함 유무 )
  created?: string  //   ( 생성일, 년원일 포함 유무 )
}