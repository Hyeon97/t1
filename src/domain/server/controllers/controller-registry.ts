/////////////////////////////////////
//  Server Controller 선언 및 관리  //
/////////////////////////////////////

import { serverService } from "../services/service-registry"
import { ServerController } from "./server.controller"

/**
 * server 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  Server 정보 조회
export const serverController = new ServerController({ serverService })
