///////////////////////////
//  ZDM 파티션 정보 DTO  //
///////////////////////////

import { formatDiskSize } from "../../../../utils/data-convert.util"
import { ZdmInfoPartitionTable } from "../../types/db/center-info-partition"

export class ZdmPartitionInfoDTO {
  size: number
  used: number
  free: number
  usage: string
  letter: string
  device: string
  fileSystem: string
  lastUpdated: string

  constructor({ partition }: { partition: ZdmInfoPartitionTable }) {
    this.size = partition.nPartSize
    this.used = partition.nPartUsed
    this.free = partition.nPartFree
    this.usage = "-"
    this.letter = partition.sLetter
    this.device = partition.sDevice
    this.fileSystem = partition.sFileSystem || "Unknwon"
    this.lastUpdated = partition.sLastUpdateTime || "Unknwon"
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
      size: this.formatSize({ size: String(this.size) }),
      used: this.formatSize({ size: String(this.used) }),
      free: this.formatSize({ size: String(this.free) }),
      usage: `${((this.used / this.size) * 100).toFixed(2)}%`,
      letter: this.letter,
      device: this.device,
      fileSystem: this.fileSystem,
      lastUpdated: this.lastUpdated,
    }
  }

  static fromEntity({ partition }: { partition: ZdmInfoPartitionTable }): ZdmPartitionInfoDTO {
    return new ZdmPartitionInfoDTO({ partition })
  }

  static fromEntities({ partitions }: { partitions: ZdmInfoPartitionTable[] }): ZdmPartitionInfoDTO[] {
    return partitions.map((partition) => ZdmPartitionInfoDTO.fromEntity({ partition }))
  }
}
