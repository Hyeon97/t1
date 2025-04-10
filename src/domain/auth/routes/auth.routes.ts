import { Router } from "express"
import { asyncContextMiddleware } from "../../../middlewares/logging/asyncContextMiddleware"
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
    this.router.post("/issue", asyncContextMiddleware, validateTokenIssueBody, tokenController.issueToken)
  }
}
