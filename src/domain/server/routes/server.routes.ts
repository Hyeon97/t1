import { Router } from "express"
import { serverGetController } from "../controllers/controller-registry"
import {
  validateServerGetByServerIdParams,
  validateServerGetByServerNameParams,
  validateServerGetQuery
} from "../validators/server.validators"

export class ServerRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.serverRoutes()
  }

  private serverRoutes(): void {
    //  [Server 정보 조회]
    //  전체 목록 리턴
    this.router.get("/", validateServerGetQuery, serverGetController.getServers)
    //  Server 이름으로 조회
    this.router.get('/server-name/:serverName', validateServerGetByServerNameParams, validateServerGetQuery, serverGetController.getServerByName)
    //  Server ID로 조회
    this.router.get('/server-id/:serverId', validateServerGetByServerIdParams, validateServerGetQuery, serverGetController.getServerById)
    //  [Server 정보 삭제]
    //  특정 조건으로 삭제 ( 기준 : server name | server id )
    this.router.delete("/:identifier")
    //  Server 이름으로 삭제
    this.router.delete('/server-name/:serverName')
    //  Server ID로 삭제
    this.router.delete('/server-id/:serverID')
  }
}
