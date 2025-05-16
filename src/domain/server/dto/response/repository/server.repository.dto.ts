//////////////////////////////////////
//  Server repository 정보 출력 DTO  //
//////////////////////////////////////

import { OSTypeMap } from "../../../../../types/common/os"
import { formatDiskSize } from "../../../../../utils/data-convert.utils"
import { ServerRepositoryTable } from "../../../types/db/server-repository"
import { ServerRepositoryTypeMap } from "../../../types/server-repository.type"

export class ServerRepositoryInfoDTO {
  id: string  //  Repository ID
  os: string  //  Repository OS
  type: string  //  Repository Type
  size: string  //  Repository 크기
  used: string  //  사용 중인 용량
  free: string  //  남은 용량
  usage: string //  사용율
  localPath: string  //  로컬 경로
  remotePath: string  //  원격 경로
  remoteUser: string  //  접속 권한 유저 ID or Mail
  ipAddress: string[]  //  접속 가능한 IP 목록
  port: string  //  접속시 사용할 포트
  lastUpdated: string //  마지막 정보 업데이트 시간

  constructor({ repository }: { repository: ServerRepositoryTable }) {
    this.id = String(repository.nID)
    this.os = OSTypeMap.toString({ value: repository.nOS })
    this.type = ServerRepositoryTypeMap.toString({ value: repository.nType })
    this.localPath = repository.sLocalPath
    this.remotePath = repository.sRemotePath
    this.remoteUser = repository.sRemoteUser
    this.ipAddress = repository.sIPAddress.split('|').filter(el => el)
    this.port = String(repository.nZConverterPort)
    this.lastUpdated = repository.sLastUpdateTime

    //  계산 값 저장
    const size = repository.nUsedSize + repository.nFreeSize
    const sizeValue = String(size)
    const usedValue = String(repository.nUsedSize)
    const freeValue = String(repository.nFreeSize)

    this.size = sizeValue
    this.used = usedValue
    this.free = freeValue


    // 사용률 계산 (0으로 나누기 방지)
    const partSize = size || 1
    this.usage = `${((repository.nUsedSize / partSize) * 100).toFixed(2)}%`
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
      id: this.id,
      os: this.os,
      size: this.formatSize({ size: this.size }),
      used: this.formatSize({ size: this.used }),
      free: this.formatSize({ size: this.free }),
      usage: this.usage,
      type: this.type,
      localPath: this.localPath,
      remotePath: this.remotePath,
      remoteUser: this.remoteUser,
      ipAddress: this.ipAddress,
      port: this.port,
      lastUpdated: this.lastUpdated,
    }
  }

  static fromEntity({ repository }: { repository: ServerRepositoryTable }): ServerRepositoryInfoDTO {
    return new ServerRepositoryInfoDTO({ repository })
  }

  static fromEntities({ repositories }: { repositories: ServerRepositoryTable[] }): ServerRepositoryInfoDTO[] {
    return repositories.map((repository) => ServerRepositoryInfoDTO.fromEntity({ repository }))
  }
}
