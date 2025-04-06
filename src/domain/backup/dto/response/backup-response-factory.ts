////////////////////////////////////////////////
//  Backup 작업 정보 조회 응답 DTO 생성 팩토리  //
////////////////////////////////////////////////

import { BackupDataResponse } from "../../types/backup-response.type"
import { BackupResponseBaseDTO } from "./backup-response-base.dto"
import { BackupResponseDetailDTO } from "./backup-response-detail.dto"

export class BackupResponseFactory {
  /**
   * 단일 엔티티에서 응답 DTO 생성
   */
  static createFromEntity({
    detail,
    backupData,
  }: {
    detail: boolean
    backupData: BackupDataResponse
  }): BackupResponseBaseDTO | BackupResponseDetailDTO {
    return detail ? BackupResponseDetailDTO.fromEntity({ backupData }) : BackupResponseBaseDTO.fromEntity({ backupData })
  }

  /**
   * 엔티티 배열에서 응답 DTO 배열 생성
   */
  static createFromEntities({
    detail,
    backupsData,
  }: {
    detail: boolean
    backupsData: BackupDataResponse[]
  }): (BackupResponseBaseDTO | BackupResponseDetailDTO)[] {
    return detail ? BackupResponseDetailDTO.fromEntities({ backupsData }) : BackupResponseBaseDTO.fromEntities({ backupsData })
  }
}
