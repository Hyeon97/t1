//////////////////////////////////
//  ZDM Controller 선언 및 관리  //
//////////////////////////////////

import { zdmGetService } from "../services/service-registry"
import { ZdmGetController } from "./common/zdm-get.controller"

/**
 * ZDM 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  ZDM 정보 조회
export const zdmGetController = new ZdmGetController({ zdmGetService })
