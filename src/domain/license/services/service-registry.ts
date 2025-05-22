//////////////////////////////////
//  License Service 선언 및 관리  //
//////////////////////////////////

import { ZconLicenseRepository } from "../repositories/zcon-license.repository"
import { LicenseGetService } from "./license-get.service"

/**
 * 레포지토리 인스턴스 생성
 */
const zconLicenseRepository = new ZconLicenseRepository()
const zconLicenseHistoryRepository = new ZconLicenseRepository()

/**
 * 서비스 인스턴스 생성 및 의존성 주입
 */
//  License 정보 조회 Service
export const licenseGetService = new LicenseGetService({
  licenseRepository: zconLicenseRepository
})