////////////////////////////////////////////
//  특정 Backup data 조회 필터링 옵션 DTO  //
////////////////////////////////////////////

import { IsIn } from "class-validator"
import { BackupSearchType } from "../../types/backup-common.type"
import { BackupFilterDTO } from "./backup-query-filter.dto"

export class SpecificBackupFilterDTO extends BackupFilterDTO {
  //  식별자
  @IsIn(["name", "id", "serverName"], { message: 'identifierType는 필수이며 값은 "name", "serverName", "id"만 가능합니다' })
  identifierType!: BackupSearchType
}