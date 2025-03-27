import { tokenService } from "../services/services"
import { TokenController } from "./token.controller"

/**
 * Auth Controller 선언 및 관리
 */

//  기본 token controller
export const tokenController = new TokenController({ tokenService })
