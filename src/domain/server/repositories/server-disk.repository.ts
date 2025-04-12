import { asyncContextStorage } from "../../../utils/AsyncContext"
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
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemNames", state: "start" })
      if (systemNames.length === 0) {
        return []
      }

      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
      const result = await this.executeQuery<ServerDiskTable[]>({ sql: query, params: systemNames, request: "findBySystemNames" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemNames", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findBySystemNames",
        message: "[시스템 이름으로 디스크 정보 조회] - 오류가 발생했습니다",
      })
    }
  }
}
