///////////////////////////////////////////
//  License 정보 조회 응답 DTO 생성 팩토리  //
//////////////////////////////////////////

import { LicenseDataResponse } from "../../types/license-response.type"
import { LicenseResponseBaseDTO } from "./license-response-base.dto"


export class LicenseResponseFactory {
  /**
   * 단일 엔티티에서 응답 DTO 생성
   */
  static createFromEntity({ licenseData, }: { licenseData: LicenseDataResponse }): LicenseResponseBaseDTO {
    return LicenseResponseBaseDTO.fromEntity({ licenseData: licenseData.items })
  }

  /**
   * 엔티티 배열에서 응답 DTO 배열 생성
   */
  static createFromEntities({ licenseData, }: { licenseData: LicenseDataResponse[] }): LicenseResponseBaseDTO[] {
    return LicenseResponseBaseDTO.fromEntities({ licenseData })
  }
}