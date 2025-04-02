////////////////////////////////////////
//  zdm data 조회 공통 필터링 옵션 DTO  //
////////////////////////////////////////

import { IsIn, IsOptional } from "class-validator"
import { ZDMActivationType, ZDMConnectType } from "../../../types/zdm-common.type"
import { ZdmFilterOptions } from "../../../types/zdm/zdm-filter.type"

export class ZdmQueryFilterDTO implements ZdmFilterOptions {
  //  일반 필터링
  @IsOptional()
  @IsIn(["connect", "disconnect"], { message: "connection은 'connect' 또는 'disconnect'만 가능합니다" })
  connection?: ZDMConnectType

  @IsOptional()
  @IsIn(["ok", "fail"], { message: "activation은 'ok' 또는 'fail'만 가능합니다" })
  activation?: ZDMActivationType

  //  추가 정보
  @IsOptional()
  @IsIn(["true"], { message: "network는 'true'만 가능합니다" })
  network?: string

  @IsOptional()
  @IsIn(["true"], { message: "disk는 'true'만 가능합니다" })
  disk?: string

  @IsOptional()
  @IsIn(["true"], { message: "partition은 'true'만 가능합니다" })
  partition?: string

  @IsOptional()
  @IsIn(["true"], { message: "repository는 'true'만 가능합니다" })
  repository?: string

  @IsOptional()
  @IsIn(["true"], { message: "zosRepository는 'true'만 가능합니다" })
  zosRepository?: string

  //  상세 정보 추가
  @IsOptional()
  @IsIn(["true"], { message: "detail은 'true'만 가능합니다" })
  detail?: string
}
