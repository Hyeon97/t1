////////////////////////////////////
//  Schedule Service 선언 및 관리  //
////////////////////////////////////

import { ZdmRepository } from "../../zdm/repositories/center-info.repository"
import { zdmGetService } from "../../zdm/services/service-registry"
import { ScheduleRepository } from "../repositories/schedule-info"
import { ScheduleGetService } from "./schedule-get.service"
import { ScheduleRegistService } from "./schedule-regist.service"
import { ScheduleVerifiService } from "./schedule-verify.service"

/**
 * 리포지토리 인스턴스 생성
 */
const scheduleRepository = new ScheduleRepository()
const zdmRepository = new ZdmRepository()
/**
 * 서비스 인스턴스 생성 및 의존성 주입
 */
//  Schedule 정보 검증 Service
export const scheduleVerifiService = new ScheduleVerifiService()
//  Schedule 정보 조회 Service
export const scheduleGetService = new ScheduleGetService({ scheduleRepository, zdmRepository })
//  Schedule 정보 등록 Service
export const scheduleRegistService = new ScheduleRegistService({ scheduleRepository, scheduleVerifiService, zdmGetService })
