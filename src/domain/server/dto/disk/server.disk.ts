//////////////////////
//  디스크 정보 DTO  //
//////////////////////

import { DiskTypeMap } from "../../../../types/common/disk"
import { formatDiskSize } from "../../../../utils/data-convert.util"
import { ServerDiskTable } from "../../types/db/server-disk"

export class ServerDiskInfoDTO {
  device: string
  diskType: string
  diskSize: string
  lastUpdated: string

  constructor({ disk }: { disk: ServerDiskTable }) {
    this.device = disk.sDevice
    this.diskType = DiskTypeMap.toString({ value: disk.nDiskType })
    this.diskSize = disk.sDiskSize // 원본 크기만 저장
    this.lastUpdated = disk.sLastUpdateTime || "Unknown" // 철자 수정
  }

  /**
   * 포맷팅된 디스크 크기 반환
   */
  formatSize(): string {
    try {
      if (!this.diskSize) {
        return this.diskSize
      }
      return `${this.diskSize} (${formatDiskSize({ sizeInBytes: this.diskSize })})`
    } catch (error) {
      return this.diskSize
    }
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    return {
      device: this.device,
      diskType: this.diskType,
      diskSize: this.formatSize(), // 직렬화 시 포맷팅된 크기 사용
      lastUpdated: this.lastUpdated,
    }
  }

  static fromEntity({ disk }: { disk: ServerDiskTable }): ServerDiskInfoDTO {
    return new ServerDiskInfoDTO({ disk })
  }

  static fromEntities({ disks }: { disks: ServerDiskTable[] }): ServerDiskInfoDTO[] {
    return disks.map((disk) => ServerDiskInfoDTO.fromEntity({ disk }))
  }
}
