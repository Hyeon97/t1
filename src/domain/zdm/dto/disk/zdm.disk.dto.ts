//////////////////////////
//  ZDM 디스크 정보 DTO  //
//////////////////////////

import { DiskTypeMap } from "../../../../types/common/disk"
import { formatDiskSize } from "../../../../utils/data-convert.utils"
import { ZdmInfoDiskTable } from "../../types/db/center-info-disk"

export class ZdmDiskInfoDTO {
  diskType: string
  diskSize: string
  diskCaption: string
  lastUpdated: string

  constructor({ disk }: { disk: ZdmInfoDiskTable }) {
    this.diskCaption = disk.sDiskCaption || "-"
    this.diskType = DiskTypeMap.toString({ value: disk.nDiskType })
    this.diskSize = disk.sDiskSize || "-"
    this.lastUpdated = disk.sLastUpdateTime || "Unknwon"
  }

  /**
   * 포맷팅된 디스크 크기 반환
   */
  formatSize(): string {
    try {
      if (!this.diskSize || this.diskSize === "-") {
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
      diskType: this.diskType,
      diskSize: this.formatSize(), // 직렬화 시 포맷팅된 크기 사용
      diskCaption: this.diskCaption,
      lastUpdated: this.lastUpdated,
    }
  }

  static fromEntity({ disk }: { disk: ZdmInfoDiskTable }): ZdmDiskInfoDTO {
    return new ZdmDiskInfoDTO({ disk })
  }

  static fromEntities({ disks }: { disks: ZdmInfoDiskTable[] }): ZdmDiskInfoDTO[] {
    return disks.map((disk) => ZdmDiskInfoDTO.fromEntity({ disk }))
  }
}
