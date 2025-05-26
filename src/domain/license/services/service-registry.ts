//////////////////////////////////
//  License Service 선언 및 관리  //
//////////////////////////////////

import { JobInteractiveRepository } from "../../interactive/repositories/job-interactive.repository"
import { jobInteractiveService } from "../../interactive/services/service-registry"
import { ServerBasicRepository } from "../../server/repositories/server-basic.repository"
import { serverGetService } from "../../server/services/service-registry"
import { zdmGetService } from "../../zdm/services/service-registry"
import { LicenseHistoryRepository } from "../repositories/zcon-license-history.repository"
import { LicenseRepository } from "../repositories/zcon-license.repository"
import { LicenseAssignService } from "./license-assign.service"
import { LicenseGetService } from "./license-get.service"

/**
 * 레포지토리 인스턴스 생성
 */
const zconLicenseRepository = new LicenseRepository()
const zconLicenseHistoryRepository = new LicenseHistoryRepository()
const jobInteractiveRepository = new JobInteractiveRepository()
const serverBasicRepository = new ServerBasicRepository()

/**
 * 서비스 인스턴스 생성 및 의존성 주입
 */
//  License 정보 조회 Service
export const licenseGetService = new LicenseGetService({
  licenseRepository: zconLicenseRepository,
})
//  License 할당 Service
export const licenseAssignService = new LicenseAssignService({
  licenseRepository: zconLicenseRepository,
  licenseHistoryRepository: zconLicenseHistoryRepository,
  jobInteractiveRepository,
  serverBasicRepository,
  jobInteractiveService,
  licenseGetService,
  serverGetService,
  zdmGetService,
})
