//////////////////////////////////
//  ZDM Controller 선언 및 관리  //
//////////////////////////////////

import { ZdmController } from "./zdm.controller"

/**
 * ZDM 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  ZDM 정보 조회
export const zdmController = new ZdmController({ zdmService })
