import { Router } from "express"
import { licenseAssignController, licenseDeleteController, licenseGetController, licenseRegistController } from "../controllers/controller-registry"
import { validateLicenseAssignBody, validateLicenseDeleteByLicenseIdParams, validateLicenseGetQuery, validateLicenseRegistBody } from "../validators/license.validators"

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
    this.router.put('/assign', validateLicenseAssignBody, licenseAssignController.assign)
    //  [License 등록]
    this.router.post('/', validateLicenseRegistBody, licenseRegistController.regist)
    //  [License 삭제]
    //  License Key로 삭제
    // this.router.delete('/license-key/:licenseKey', validateLicenseDeleteByLicenseKeyParams, licenseDeleteController.deleteByKey)
    //  License ID로 삭제
    this.router.delete('/license-id/:licenseId', validateLicenseDeleteByLicenseIdParams, licenseDeleteController.deleteById)
  }

  //  License History 관련
  private licenseHistoryRoutes(): void {
    //  License ID로 조회
    //  License type으로 조회
    //  License 할당 server 이름으로 조회
  }
}