/////////////////////////////////////
//  License Controller 선언 및 관리  //
/////////////////////////////////////

import { licenseAssignService, licenseDeleteService, licenseGetService, licenseRegistService } from "../services/service-registry"
import { LicenseAssignController } from "./license-assign.controller"
import { LicenseDeleteController } from "./license-delete.controller"
import { LicenseGetController } from "./license-get.controller"
import { LicenseRegistController } from "./license-regist.controller"

/**
 * License 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  License 정보 조회 Controller
export const licenseGetController = new LicenseGetController({ licenseGetService })
//  License 할당 Controller
export const licenseAssignController = new LicenseAssignController({ licenseAssignService })
//  License 등록 Controller
export const licenseRegistController = new LicenseRegistController({ licenseRegistService })
//  License 삭제 Controller
export const licenseDeleteController = new LicenseDeleteController({ licenseDeleteService })