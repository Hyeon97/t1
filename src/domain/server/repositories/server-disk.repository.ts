import { BaseRepository } from "../../../utils/base/base-repository"
import { ServerDiskTable } from "../types/db/server-disk"

export class ServerDiskRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ServerDiskRepository",
      tableName: "server_disk",
    })
  }

  /**
   * 특정 시스템 이름을 가진 서버들의 디스크 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ServerDiskTable[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }

      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`

      return await this.executeQuery<ServerDiskTable[]>({ sql: query, params: systemNames, request: "findBySystemNames" })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        functionName: "findBySystemNames",
        message: "시스템 이름으로 디스크 정보 조회 중 오류가 발생했습니다",
      })
    }
  }
}
