///////////////////////////////////
//  ZDM ZOS Repository 정보 DTO  //
///////////////////////////////////

import { ZdmZosRepositoryTable } from "../../../types/db/center-zos-repository"
import { ZdmZosRepositoryDataResponse } from "../../../types/zdm-zos-repository/zdm-repository-response.type"

export class ZdmZosRepositoryInfoDTO {
  id: string
  centerName: string
  size: string
  platform: string
  cloudKeyId: string
  bucketName: string
  created: string
  lastUpdated: string
  constructor({ zos }: { zos: ZdmZosRepositoryTable }) {
    this.id = String(zos.nID)
    this.centerName = zos.sSystemName
    this.size = zos.sSize
    this.platform = zos.sCloudPlatform
    this.cloudKeyId = String(zos.nCloudKeyID)
    this.bucketName = zos.sBucketName
    this.created = zos.sCreatedTime || '-'
    this.lastUpdated = zos.sUpdateTime
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      centerName: this.centerName,
      size: this.size,
      platform: this.platform,
      cloudKeyId: this.cloudKeyId,
      bucketName: this.bucketName,
      created: this.created,
      lastUpdated: this.lastUpdated,
    }
  }

  static fromEntity({ repositories }: { repositories: ZdmZosRepositoryTable }): ZdmZosRepositoryInfoDTO {
    return new ZdmZosRepositoryInfoDTO({ zos: repositories })
  }

  static fromEntities({ repositories }: { repositories: ZdmZosRepositoryDataResponse | ZdmZosRepositoryTable[] }): ZdmZosRepositoryInfoDTO[] {
    if ("items" in repositories) {
      return repositories.items.map((repositories) => ZdmZosRepositoryInfoDTO.fromEntity({ repositories }))
    } else {
      return repositories.map((repositories) => ZdmZosRepositoryInfoDTO.fromEntity({ repositories }))
    }
  }
}