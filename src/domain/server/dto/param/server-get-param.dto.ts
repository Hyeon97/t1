///////////////////////////////////
//  Server data 조회 파라미터 DTO  //
///////////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

/**
 * Server 이름으로 조회
 */
export class ServerGetByNameDTO {
  @IsNotEmpty({ message: "ServerName은 필수 입니다." })
  @IsString()
  @Expose()
  serverName!: string
}

/**
 * Server ID로 조회
 */
export class ServerGetByIdDTO {
  @IsNotEmpty({ message: "ServerID는 필수 입니다." })
  @IsNumber()
  @Expose()
  serverId!: number
}