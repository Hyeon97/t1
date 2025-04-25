import { Router } from "express"
import { scheduleController } from "../controllers/controller-registry"

export class ScheduleRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.scheduleRoutes()
  }

  //  Schedule 관련
  private scheduleRoutes(): void {
    //  전체 목록 리턴
    this.router.get("/", scheduleController.getSchedules)
    //  특정 조건으로 조회 ( 기준 : Schedule 등록 job name | Schedule id )
    // this.router.get("/:identifier", validateSpecificZdmParams, validateSpecificZdmQuery, scheduleController.getZdm)
    // //  Schedule 등록
    // this.router.post("/")
    // //  특정 조건으로 삭제 ( 기준 : Schedule 등록 job name | Schedule id )
    // this.router.delete("/:identifier")
  }
}
