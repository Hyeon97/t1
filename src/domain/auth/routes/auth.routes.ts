import { Router } from "express"
import { requestLogger } from "../../../middlewares/logging/requestLogger"
import { tokenController } from "../controllers/controller-registry"
import { validateTokenIssueBody } from "../validators/token.validators"

export class AuthRoutes {
  public router: Router

  constructor() {
    this.router = Router()
    this.tokenRoutes()
  }

  private tokenRoutes(): void {
    //  token 발급
    this.router.post("/issue", requestLogger, validateTokenIssueBody, tokenController.issueToken)
  }
}
