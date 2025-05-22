///////////////////////////////////////////
//  License 정보 조회 응답 DTO 생성 팩토리  //
//////////////////////////////////////////

import { ZconLicenseTable } from "../../types/db/zcon_license"
import { LicenseResponseBaseDTO } from "./license-response-base.dto"


export class LicenseResponseFactory {
  /**
   * 단일 엔티티에서 응답 DTO 생성
   */
  static createFromEntity({ licenseData }: { licenseData: ZconLicenseTable }): LicenseResponseBaseDTO {
    return LicenseResponseBaseDTO.fromEntity({ licenseData })
  }

  /**
   * 엔티티 배열에서 응답 DTO 배열 생성
   */
  static createFromEntities({ licenseData }: { licenseData: ZconLicenseTable[] }): LicenseResponseBaseDTO[] {
    return LicenseResponseBaseDTO.fromEntities({ licenseData })
  }
}