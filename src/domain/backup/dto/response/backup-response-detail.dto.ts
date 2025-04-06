////////////////////////////////
//  상세 Backup 정보 응답 DTO  //
////////////////////////////////

import { BackupDataResponse, BackupResponseDetailFields, DEFAULT_VALUES_BACKUP_RESPONSE } from "../../types/backup-response.type"
import { BackupResponseBaseDTO } from "./backup-response-base.dto"

export class BackupResponseDetailDTO extends BackupResponseBaseDTO implements BackupResponseDetailFields {
  option: {
    rotation: string
    excludeDir: string
    compression: string
    encryption: string
  }

  constructor(props: Partial<BackupResponseDetailFields>) {
    super(props) // 기본 속성 초기화

    // 상세 속성 초기화
    this.option = props.option || DEFAULT_VALUES_BACKUP_RESPONSE.option!
  }

  /**
   * JSON 직렬화를 위한 메서드 (오버라이드)
   */
  toJSON(): Record<string, any> {
    const baseJson = super.toJSON()
    const { lastUpdate, timestamp, ...restBaseProps } = baseJson

    // 객체 리턴 순서 변경
    return {
      ...restBaseProps,
      option: this.option,
      timestamp,
      lastUpdate,
    }
  }

  /**
   * 엔티티에서 상세 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ backupData }: { backupData: BackupDataResponse }): BackupResponseDetailDTO {
    const { info } = backupData
    const baseDTO = BackupResponseBaseDTO.fromEntity({ backupData })

    return new BackupResponseDetailDTO({
      ...baseDTO,
      option: {
        rotation: info && info.nRotation ? String(info.nRotation) : DEFAULT_VALUES_BACKUP_RESPONSE.option.rotation,
        excludeDir: info && info.sExcludeDir ? info.sExcludeDir : DEFAULT_VALUES_BACKUP_RESPONSE.option.excludeDir,
        compression: info && info.nCompression ? "Use" : DEFAULT_VALUES_BACKUP_RESPONSE.option.compression,
        encryption: info && info.nEncryption ? "Use" : DEFAULT_VALUES_BACKUP_RESPONSE.option.encryption,
      },
    })
  }

  /**
   * 엔티티 배열에서 상세 DTO 배열로 변환
   */
  static fromEntities({ backupsData }: { backupsData: BackupDataResponse[] }): BackupResponseDetailDTO[] {
    return backupsData.map((backupData) => BackupResponseDetailDTO.fromEntity({ backupData }))
  }
}
