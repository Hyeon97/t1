/**
 * User Service 선언 및 관리
 */

import { UserInfoRepository } from "../repositories/user-info.repository"
import { UserService } from "./user.service"

//  service에 주입할 repositoy 선언
const userInfoRepository = new UserInfoRepository()

//  기본 user service
export const userService = new UserService({ userInfoRepository })
