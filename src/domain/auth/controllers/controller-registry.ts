/**
 * Auth Controller 선언 및 관리
 */
import { tokenService } from "../services/service-registry"
import { TokenController } from "./token.controller"

// 토큰 컨트롤러 인스턴스 생성 및 의존성 주입
export const tokenController = new TokenController({ tokenService })
