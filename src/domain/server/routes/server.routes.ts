import { Router } from "express"
import { serverController } from "../controllers/controller-registry"
import { validateServerListQuery, validateSpecificServerParams, validateSpecificServerQuery } from "../validators/server.validators"

export class ServerRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.serverRoutes()
  }

  private serverRoutes(): void {
    //  전체 목록 리턴
    this.router.get("/", validateServerListQuery, serverController.getServers)
    //  특정 조건으로 조회 ( 기준 : server name | server id )
    this.router.get("/:identifier", validateSpecificServerParams, validateSpecificServerQuery, serverController.getServer)
    //  특정 조건으로 삭제 ( 기준 : server name | server id )
    this.router.delete("/:identifier")
  }
}
