//////////////////////////////////////////
//  JobInteractive Service 선언 및 관리  //
//////////////////////////////////////////

import { JobInteractiveRepository } from "../../interactive/repositories/job-interactive.repository"
import { JobInteractiveService } from "../../interactive/services/interactive.service"

/**
 * 레포지토리 인스턴스 생성
 */
const jobInteractiveRepository = new JobInteractiveRepository()

/**
 * 서비스 인스턴스 생성 및 의존성 주입
 */
export const jobInteractiveService = new JobInteractiveService({
  jobInteractiveRepository,
})
