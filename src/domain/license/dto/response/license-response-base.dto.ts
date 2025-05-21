////////////////////////////////
//  기본 License 정보 응답 DTO  //
////////////////////////////////

import { ZconLicenseTable } from "../../types/db/zcon_license"
import { DEFAULT_VALUES_LICENSE_RESPONSE, LicenseResponseFields } from "../../types/license-response.type"


export class LicenseResponseBaseDTO implements LicenseResponseFields {
  id: string
  licenseCategory: string
  licenseCopyNumber: string
  licenseUseCopyNumber: string
  licenseKey: string
  licenseExpirationDate: string
  licenseCreateDate: string

  constructor({
    id = DEFAULT_VALUES_LICENSE_RESPONSE.id,
    licenseCategory = DEFAULT_VALUES_LICENSE_RESPONSE.licenseCategory,
    licenseCopyNumber = DEFAULT_VALUES_LICENSE_RESPONSE.licenseCopyNumber,
    licenseUseCopyNumber = DEFAULT_VALUES_LICENSE_RESPONSE.licenseUseCopyNumber,
    licenseKey = DEFAULT_VALUES_LICENSE_RESPONSE.licenseKey,
    licenseExpirationDate = DEFAULT_VALUES_LICENSE_RESPONSE.licenseExpirationDate,
    licenseCreateDate = DEFAULT_VALUES_LICENSE_RESPONSE.licenseCreateDate,
  }: Partial<LicenseResponseFields> = {}) {
    this.id = id
    this.licenseCategory = licenseCategory
    this.licenseCopyNumber = licenseCopyNumber
    this.licenseUseCopyNumber = licenseUseCopyNumber
    this.licenseKey = licenseKey
    this.licenseExpirationDate = licenseExpirationDate
    this.licenseCreateDate = licenseCreateDate
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      licenseCategory: this.licenseCategory,
      licenseCopyNumber: this.licenseCopyNumber,
      licenseUseCopyNumber: this.licenseUseCopyNumber,
      licenseKey: this.licenseKey,
      licenseExpirationDate: this.licenseExpirationDate,
      licenseCreateDate: this.licenseCreateDate,
    }
  }

  /**
   * 엔티티에서 기본 DTO로 변환
   */
  static fromEntity({ licenseData }: { licenseData: ZconLicenseTable }): LicenseResponseBaseDTO {
    return new LicenseResponseBaseDTO({
      id: String(licenseData.nID),
      licenseCategory: String(licenseData.nLicenseCategory),
      licenseCopyNumber: String(licenseData.nLicenseCopyNumber),
      licenseUseCopyNumber: String(licenseData.nLicenseUseCopyNumber),
      licenseKey: licenseData.sLicenseKey,
      licenseCreateDate: licenseData.sLicenseCreateDate,
      licenseExpirationDate: licenseData.sLicenseExpirationDate,
    })
  }

  /**
   * 엔티티 배열에서 기본 DTO 배열로 변환
   */
  static fromEntities({ licenseData }: { licenseData: ZconLicenseTable[] }): LicenseResponseBaseDTO[] {
    return licenseData.map((licenseData) => LicenseResponseBaseDTO.fromEntity({ licenseData }))
  }
}