///////////////////////////////
//  ZDM Repository 정보 DTO  //
///////////////////////////////

import { OSTypeMap } from "../../../../types/common/os"
import { RepositoryTypeMap } from "../../../../types/common/repository"
import { formatDiskSize } from "../../../../utils/data-convert.utils"
import { ZdmRepositoryTable } from "../../types/db/center-repository"
import { ZdmRepositoryDataResponse } from "../../types/zdm-repository/zdm-repository-response.type"

export class ZdmRepositoryInfoDTO {
  id: string
  centerName: string
  os: string
  type: string
  size: number
  used: number
  free: number
  usage: string
  remotePath: string
  ipAddress: string
  port: string
  lastUpdated: string
  constructor({ repo }: { repo: ZdmRepositoryTable }) {
    this.id = String(repo.nID)
    this.centerName = repo.sSystemName
    this.os = OSTypeMap.toString({ value: repo.nOS })
    this.type = RepositoryTypeMap.toString({ value: repo.nType })
    this.used = repo.nUsedSize
    this.free = repo.nFreeSize
    this.size = repo.nUsedSize + repo.nFreeSize
    this.usage = "-"
    this.remotePath = repo.sRemotePath
    this.ipAddress = repo.sIPAddress
    this.port = String(repo.nZConverterPort)
    this.lastUpdated = repo.sLastUpdateTime || "Unknwon"
  }

  formatSize({ size }: { size: string }): string {
    try {
      if (!size) {
        return size
      }
      return `${size} (${formatDiskSize({ sizeInBytes: size })})`
    } catch (error) {
      return size
    }
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      centerName: this.centerName,
      os: this.os,
      type: this.type,
      size: this.formatSize({ size: String(this.size) }),
      used: this.formatSize({ size: String(this.used) }),
      free: this.formatSize({ size: String(this.free) }),
      usage: `${((this.used / (this.used + this.free)) * 100).toFixed(2)}%`,
      remotePath: this.remotePath,
      ipAddress: this.ipAddress,
      port: this.port,
      lastUpdated: this.lastUpdated,
    }
  }

  static fromEntity({ repositories }: { repositories: ZdmRepositoryTable }): ZdmRepositoryInfoDTO {
    return new ZdmRepositoryInfoDTO({ repo: repositories })
  }

  static fromEntities({ repositories }: { repositories: ZdmRepositoryDataResponse | ZdmRepositoryTable[] }): ZdmRepositoryInfoDTO[] {
    if ("items" in repositories) {
      return repositories.items.map((repositories) => ZdmRepositoryInfoDTO.fromEntity({ repositories }))
    } else {
      return repositories.map((repositories) => ZdmRepositoryInfoDTO.fromEntity({ repositories }))
    }
  }
}
