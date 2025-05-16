///////////////////////////////
//  ZDM Repository 정보 DTO  //
///////////////////////////////

import { OSTypeMap } from "../../../../../types/common/os"
import { RepositoryTypeMap } from "../../../../../types/common/repository"
import { formatDiskSize } from "../../../../../utils/data-convert.utils"
import { ZdmRepositoryTable } from "../../../types/db/center-repository"
import { ZdmRepositoryDataResponse } from "../../../types/zdm-repository/zdm-repository-response.type"

export class ZdmRepositoryInfoDTO {
  id: string
  centerName: string
  os: string
  type: string
  size: string
  used: string
  free: string
  usage: string
  remotePath: string
  ipAddress: string[]
  port: string
  lastUpdated: string
  constructor({ repo }: { repo: ZdmRepositoryTable }) {
    this.id = String(repo.nID)
    this.centerName = repo.sSystemName
    this.os = OSTypeMap.toString({ value: repo.nOS })
    this.type = RepositoryTypeMap.toString({ value: repo.nType })
    this.remotePath = repo.sRemotePath
    this.ipAddress = repo.sIPAddress.split('|').filter(el => el)
    this.port = String(repo.nZConverterPort)
    this.lastUpdated = repo.sLastUpdateTime || "Unknwon"

    //  계산 값 저장
    const size = repo.nUsedSize + repo.nFreeSize
    const sizeValue = String(size)
    const usedValue = String(repo.nUsedSize)
    const freeValue = String(repo.nFreeSize)

    this.size = sizeValue
    this.used = usedValue
    this.free = freeValue

    // 사용률 계산 (0으로 나누기 방지)
    const partSize = size || 1
    this.usage = `${((repo.nUsedSize / partSize) * 100).toFixed(2)}%`
  }

  /**
   * 포맷팅된 크기 값 반환
   */
  formatSize({ size }: { size: string | undefined }): string {
    if (!size) {
      return "Unknown"
    }
    return `${size} (${formatDiskSize({ sizeInBytes: size })})`
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      centerName: this.centerName,
      os: this.os,
      type: this.type,
      size: this.formatSize({ size: this.size }),
      used: this.formatSize({ size: this.used }),
      free: this.formatSize({ size: this.free }),
      usage: this.usage,
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
