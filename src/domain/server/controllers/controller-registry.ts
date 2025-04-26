/////////////////////////////////////
//  Server Controller 선언 및 관리  //
/////////////////////////////////////

import { serverGetService } from "../services/service-registry"
import { ServerGetController } from "./server-get.controller"

/**
 * server 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  Server 정보 조회
export const serverGetController = new ServerGetController({ serverGetService })
