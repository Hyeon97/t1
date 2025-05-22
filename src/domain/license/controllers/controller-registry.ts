/////////////////////////////////////
//  License Controller 선언 및 관리  //
/////////////////////////////////////

import { licenseGetService } from "../services/service-registry"
import { LicenseGetController } from "./license-get.controller"

/**
 * License 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  License 정보 조회 Controller
export const licenseGetController = new LicenseGetController({ licenseGetService })
