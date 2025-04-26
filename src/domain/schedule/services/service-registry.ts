////////////////////////////////////
//  Schedule Service 선언 및 관리  //
////////////////////////////////////

import { ScheduleRepository } from "../repositories/schedule-info"
import { ScheduleGetService } from "./schedule-get.service"

/**
 * 리포지토리 인스턴스 생성
 */
const scheduleRepository = new ScheduleRepository()
/**
 * 서비스 인스턴스 생성 및 의존성 주입
 */
//  Schedule 정보 조회 Service
export const scheduleGetService = new ScheduleGetService({ scheduleRepository })
//  Schedule 정보 등록 Service
export const scheduleRegistService = new ScheduleGetService({ scheduleRepository })
