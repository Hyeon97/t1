import { Router } from "express"

import { zdmController } from "../controllers/controller-registry"
import { validateSpecificZdmParams, validateSpecificZdmQuery, validateZdmListQuery } from "../validators/zdm"

export class ZdmRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.ZdmRoutes()
    this.ZdmRepositoryRoutes()
  }

  private ZdmRoutes(): void {
    //  전체 목록 리턴
    this.router.get("/", validateZdmListQuery, zdmController.getZdms)
    //  특정 조건으로 조회 ( 기준 : Zdm name | Zdm id )
    this.router.get("/:identifier", validateSpecificZdmParams, validateSpecificZdmQuery, zdmController.getZdm)
    //  특정 조건으로 삭제 ( 기준 : Zdm name | Zdm id )
    this.router.delete("/:identifier")
  }

  private ZdmRepositoryRoutes(): void { }
}
