import { Router } from "express"
import { zdmGetController } from "../controllers/controller-registry"
import { validateSpecificZdmParams, validateSpecificZdmQuery, validateZdmListQuery } from "../validators/zdm"

export class ZdmRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.zdmRoutes()
    this.zdmRepositoryRoutes()
    this.zdmZosRepositoryRoutes()
  }

  //  ZDM 관련
  private zdmRoutes(): void {
    //  전체 목록 리턴
    this.router.get("/", validateZdmListQuery, zdmGetController.getZdms)
    //  특정 조건으로 조회 ( 기준 : ZDM name | ZDM id )
    this.router.get("/:identifier", validateSpecificZdmParams, validateSpecificZdmQuery, zdmGetController.getZdm)
    //  특정 조건으로 삭제 ( 기준 : ZDM name | ZDM id )
    this.router.delete("/:identifier")
  }

  //  ZDM repository 관련
  private zdmRepositoryRoutes(): void {
    // //  ZDM 레포지토리 정보 추가
    // this.router.post("/:identifier/repositories")
    // //  ZDM 전체 레포지토리 조회
    // this.router.get("/repositories", validateRepositoryListQuery, zdmRepositoryController.getRepositories)
    // //  특정 ZDM의 전체 레포지토리 조회 ( 기준 : zdm id | zdm name )
    // this.router.get("/:identifier/repositories")
    // //  특정 ZDM의 특정 레포지토리 조회 ( 기준 : zdm id | zdm name, repository id )
    // this.router.get("/:identifier/repositories/:repoId")
    // //  ZDM 레포지토리 정보 삭제
    // this.router.delete("/:identifier/repositories/:repoId")
  }

  //  ZDM zos repository 관련
  private zdmZosRepositoryRoutes(): void {
    // //  ZDM zos 레포지토리 정보 추가
    // this.router.post("/:identifier/zos/repositories")
    // //  ZDM 전체 zos 레포지토리 조회
    // this.router.get("/zos/repositories")
    // //  특정 ZDM의 전체 zos 레포지토리 조회 ( 기준 : zdm id | zdm name )
    // this.router.get("/:identifier/zos/repositories")
    // //  특정 ZDM의 특정 zos 레포지토리 조회 ( 기준 : zdm id | zdm name, zos repository id )
    // this.router.get("/:identifier/zos/repositories/:repoId")
    // //  ZDM zos 레포지토리 정보 삭제
    // this.router.delete("/:identifier/zos/repositories/:repoId")
  }
}
