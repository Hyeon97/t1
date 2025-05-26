/////////////////////////////////
//  License 조회 응답 type 정의  //
/////////////////////////////////

import { ZconLicenseTable } from "./db/zcon_license"


/**
 * 기본 License 정보 응답 필드 인터페이스
 */
export interface LicenseResponseFields {
  id: string
  licenseCategory: string
  licenseCopyNumber: string
  licenseUseCopyNumber: string
  licenseKey: string
  licenseExpirationDate: string
  licenseCreateDate: string
}

/**
 * License 정보 조회 리턴 기본값 상수 정의
 */
export const DEFAULT_VALUES_LICENSE_RESPONSE = {
  id: '-',
  licenseCategory: 'Unknown',
  licenseCopyNumber: '0',
  licenseUseCopyNumber: '0',
  licenseKey: '-',
  licenseExpirationDate: '-',
  licenseCreateDate: '-',
}

/**
 * License data 조회 결과 서비스 리턴 타입
 */
export interface LicenseDataResponse {
  items: ZconLicenseTable[]
}

/**
 * License 할당 결과 서비스 리턴 타입
 */
export interface LicenseAssignResponse {
  server: {
    id: string
    name: string
  }
  license: {
    id: string
    name: string
    category: string
    created: string
    expiration: string
  }
}

/**
 * License 등록 결과 서비스 리턴 타입
 */
export interface LicenseRegistResponse {
  id: string
  name: string
  category: string
}