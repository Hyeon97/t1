///////////////////////////////
//  Backup 작업 삭제 옵션 DTO  //
///////////////////////////////

import { IsOptional } from "class-validator"
import { BackupDeleteOptions } from "../../types/backup-delete.type"

export class BackupDeleteQueryDTO implements BackupDeleteOptions {
  //  필터 옵션
  @IsOptional()
  jobName?: string

  @IsOptional()
  id?: number
}