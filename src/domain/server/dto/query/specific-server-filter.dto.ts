///////////////////////////////////////////
//  특정 server data 조회 필터링 옵션 DTO  //
///////////////////////////////////////////

import { IsIn } from "class-validator"
import { SystemSearchType } from "../../types/server-common.type"
import { ServerQueryFilterDTO } from "./server-query-filter.dto"

export class SpecificServerFilterDTO extends ServerQueryFilterDTO {
  @IsIn(["name", "id"], { message: 'identifierType는 필수이며 값은 "name" 또는 "id"만 가능합니다' })
  identifierType!: SystemSearchType
}
