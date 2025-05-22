import { Router } from "express"
import { licenseGetController } from "../controllers/controller-registry"
import { validateLicenseGetQuery } from "../validators/license.validators"

export class LicenseRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.licenseRoutes()
    this.licenseHistoryRoutes()
  }

  //  License 기본
  private licenseRoutes(): void {
    //  [License 정보 조회]
    //  전체 목록 리턴
    this.router.get('/', validateLicenseGetQuery, licenseGetController.getLicenses)
    //  [License 할당]
    this.router.put('/assign')
    //  [License 등록]
    this.router.post('/')
    //  [License 삭제]
    //  License 이름으로 삭제
    this.router.delete('/license-name/:licenseName')
    //  License ID로 삭제
    this.router.delete('/license-id/:licenseId')
  }

  //  License History 관련
  private licenseHistoryRoutes(): void {
    //  License ID로 조회
    //  License type으로 조회
    //  License 할당 server 이름으로 조회
  }
}