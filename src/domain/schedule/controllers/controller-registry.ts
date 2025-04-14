///////////////////////////////////////
//  Schedule Controller 선언 및 관리  //
///////////////////////////////////////

import { scheduleGetService } from "../services/service-registry"
import { ScheduleGetController } from "./schedule.get.controller"

/**
 * Schedule 컨트롤러 인스턴스 생성 및 의존성 주입
 */
//  Schedule 정보 조회 Controller
export const scheduleController = new ScheduleGetController({ scheduleGetService })
//  Schedule 정보 등록 Controller
// export const scheduleRegistController = new ScheduleRegistController({scheduleRegistService})
// //  Schedule 정보 삭제 Controller
// export const scheduleDeleteController = new scheduleDeleteController({scheduleDeleteService})
