////////////////////////////////////////
//  zdm data 조회 공통 필터링 옵션 DTO  //
////////////////////////////////////////

import { Expose } from "class-transformer"
import { IsIn, IsOptional } from "class-validator"
import { ZDMActivationType, ZDMConnectType } from "../../../types/zdm-common.type"
import { ZdmFilterOptions } from "../../../types/zdm/zdm-filter.type"

export class ZdmGetQueryDTO implements ZdmFilterOptions {
  //  일반 필터링
  @IsOptional()
  @IsIn(["connect", "disconnect"], { message: "connection은 'connect' 또는 'disconnect'만 가능합니다" })
  @Expose()
  connection?: ZDMConnectType

  @IsOptional()
  @IsIn(["ok", "fail"], { message: "activation은 'ok' 또는 'fail'만 가능합니다" })
  @Expose()
  activation?: ZDMActivationType

  //  추가 정보
  @IsOptional()
  @IsIn(["true", "false"], { message: "network는 'true','false'만 가능합니다" })
  @Expose()
  network?: string

  @IsOptional()
  @IsIn(["true", "false"], { message: "disk는 'true','false'만 가능합니다" })
  @Expose()
  disk?: string

  @IsOptional()
  @IsIn(["true", "false"], { message: "partition은 'true','false'만 가능합니다" })
  @Expose()
  partition?: string

  @IsOptional()
  @IsIn(["true", "false"], { message: "repository는 'true','false'만 가능합니다" })
  @Expose()
  repository?: string

  @IsOptional()
  @IsIn(["true", "false"], { message: "zosRepository는 'true','false'만 가능합니다" })
  @Expose()
  zosRepository?: string

  //  상세 정보 추가
  @IsOptional()
  @IsIn(["true", "false"], { message: "detail은 'true','false'만 가능합니다" })
  @Expose()
  detail?: string
}
