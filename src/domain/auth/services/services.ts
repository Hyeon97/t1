/**
 * Auth Service 선언 및 관리
 */
import { UserInfoRepository } from "../../user/repositories/user-info.repository"
import { UserTokenRepository } from "../../user/repositories/user-token.repository"
import { TokenService } from "./token.service"

//  service에 주입할 repositoy 선언
const userInfoRepository = new UserInfoRepository()
const userTokenRepository = new UserTokenRepository()
//  기본 token service
export const tokenService = new TokenService({ userInfoRepository, userTokenRepository })
