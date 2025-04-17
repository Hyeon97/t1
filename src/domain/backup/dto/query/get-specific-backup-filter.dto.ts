////////////////////////////////////////////
//  특정 Backup data 조회 필터링 옵션 DTO  //
////////////////////////////////////////////

import { IsIn } from "class-validator"
import { BackupSearchType } from "../../types/backup-common.type"
import { BackupGetQueryDTO } from "./get-backup-query.dto"

export class SpecificBackupGetQueryDTO extends BackupGetQueryDTO {
  //  식별자
  @IsIn(["name", "id", "serverName"], { message: 'identifierType는 필수이며 값은 "name", "serverName", "id"만 가능합니다' })
  identifierType!: BackupSearchType
}
