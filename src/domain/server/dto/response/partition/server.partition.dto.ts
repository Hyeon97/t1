/////////////////////////////////
//  Server 파티션 정보 출력 DTO  //
/////////////////////////////////

import { formatDiskSize } from "../../../../../utils/data-convert.utils"
import { ServerPartitionTable } from "../../../types/db/server-partition"

export class ServerPartitionInfoDTO {
  size: string  //  전체 파티션 크기
  used: string  //  사용 중인 용량
  free: string  //  남은 용량
  usage: string //  사용율
  letter: string  //  마운트 포인트(Lin) / 드라이브 분자(Win)
  device: string  //  디바이스 경로
  fileSystem: string  //  파일 시스템 타입
  lastUpdated: string //  마지막 정보 업데이트 시간

  constructor({ partition }: { partition: ServerPartitionTable }) {
    // 원본 값 저장
    this.letter = partition.sLetter
    this.device = partition.sDevice
    this.fileSystem = partition.sFileSystem || "Unknown"
    this.lastUpdated = partition.sLastUpdateTime || "Unknown"

    // 계산 값 저장
    const sizeValue = String(partition.nPartSize)
    const usedValue = String(partition.nPartUsed)
    const freeValue = String(partition.nPartFree)

    // 사이즈 정보 설정
    this.size = sizeValue
    this.used = usedValue
    this.free = freeValue

    // 사용률 계산 (0으로 나누기 방지)
    const partSize = partition.nPartSize || 1
    this.usage = `${((partition.nPartUsed / partSize) * 100).toFixed(2)}%`
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

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    return {
      size: this.formatSize({ size: this.size }),
      used: this.formatSize({ size: this.used }),
      free: this.formatSize({ size: this.free }),
      usage: this.usage,
      letter: this.letter,
      device: this.device,
      fileSystem: this.fileSystem,
      lastUpdated: this.lastUpdated,
    }
  }

  static fromEntity({ partition }: { partition: ServerPartitionTable }): ServerPartitionInfoDTO {
    return new ServerPartitionInfoDTO({ partition })
  }

  static fromEntities({ partitions }: { partitions: ServerPartitionTable[] }): ServerPartitionInfoDTO[] {
    return partitions.map((partition) => ServerPartitionInfoDTO.fromEntity({ partition }))
  }
}
