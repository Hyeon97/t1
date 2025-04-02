/////////////////////////////////////////
//  특정 zdm data 조회 필터링 옵션 DTO  //
/////////////////////////////////////////

import { IsIn } from "class-validator"
import { ZDMSearchType } from "../../../types/zdm-common.type"
import { ZdmQueryFilterDTO } from "./zdm-query-filter.dto"

export class SpecificZdmFilterDTO extends ZdmQueryFilterDTO {
  @IsIn(["name", "id"], { message: 'identifierType는 필수이며 값은 "name" 또는 "id"만 가능합니다' })
  identifierType!: ZDMSearchType
}
