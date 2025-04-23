///////////////////////////////////////////
//  server data 조회 공통 필터링 옵션 DTO  //
///////////////////////////////////////////

import { IsIn, IsOptional } from "class-validator"
import { OSType } from "../../../../types/common/os"
import { LicenseAssignType, SystemConnectType, SystemModeType } from "../../types/server-common.type"
import { ServerFilterOptions } from "../../types/server-filter.type"

export class ServerQueryFilterDTO implements ServerFilterOptions {
  //  일반 필터링
  @IsOptional()
  @IsIn(["source", "target"], { message: "mode는 'source' 또는 'target'만 가능합니다" })
  mode?: SystemModeType

  @IsOptional()
  @IsIn(["win", "lin"], { message: "os는 'win' 또는 'lin'만 가능합니다" })
  os?: OSType

  @IsOptional()
  @IsIn(["connect", "disconnect"], { message: "connection은 'connect' 또는 'disconnect'만 가능합니다" })
  connection?: SystemConnectType

  @IsOptional()
  @IsIn(["assign", "unassign"], { message: "license는 'assign' 또는 'unassign'만 가능합니다" })
  license?: LicenseAssignType

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

  //  상세 정보 추가
  @IsOptional()
  @IsIn(["true", "false"], { message: "detail은 'true','false'만 가능합니다" })
  detail?: string
}
