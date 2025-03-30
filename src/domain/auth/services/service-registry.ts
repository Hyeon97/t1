////////////////////////////////
//  Auth Service 선언 및 관리  //
////////////////////////////////

import { UserInfoRepository } from "../../user/repositories/user-info.repository"
import { UserTokenRepository } from "../../user/repositories/user-token.repository"
import { TokenService } from "./token.service"

// 리포지토리 인스턴스 생성
const userInfoRepository = new UserInfoRepository()
const userTokenRepository = new UserTokenRepository()

// 서비스 인스턴스 생성 및 의존성 주입
export const tokenService = new TokenService({
  userInfoRepository,
  userTokenRepository,
})
