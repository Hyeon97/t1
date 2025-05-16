import { Router } from "express"
import { zdmGetController, zdmRepositoryGetController } from "../controllers/controller-registry"
import { validateRepositoryGetQuery, validateZdmGetByZdmIdParamas, validateZdmGetByZdmNameParams, validateZdmGetQuery } from "../validators/zdm"

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
    //  [ZDM 정보 조회]
    //  전체 목록 리턴
    this.router.get("/", validateZdmGetQuery, zdmGetController.getZdms)
    //  ZDM 이름으로 조회
    this.router.get("/zdm-name/:zdmName", validateZdmGetByZdmNameParams, validateZdmGetQuery, zdmGetController.getZdmByName)
    //  ZDM ID로 조회
    this.router.get("/zdm-id/:zdmId", validateZdmGetByZdmIdParamas, validateZdmGetQuery, zdmGetController.getZdmById)
    //  [ZDM 정보 삭제]
    //  ZDM 이름으로 삭제
    this.router.delete("/zdm-name/:zdmName")
    //  ZDM ID로 삭제
    this.router.delete("/zdm-id/:zdmId")
  }

  //  ZDM repository 관련
  private zdmRepositoryRoutes(): void {
    // //  ZDM 레포지토리 정보 추가
    // this.router.post("/:identifier/repositories")
    // //  ZDM 전체 레포지토리 조회
    this.router.get("/repositories", validateRepositoryGetQuery, zdmRepositoryGetController.getRepositories)
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
