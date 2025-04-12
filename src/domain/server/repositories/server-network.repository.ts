import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ServerNetworkTable } from "../types/db/server-network"

export class ServerNetworkRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ServerNetworkRepository",
      tableName: "server_network",
    })
  }

  /**
   * 특정 시스템 이름을 가진 서버들의 네트워크 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ServerNetworkTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemNames", state: "start" })
      if (systemNames.length === 0) {
        return []
      }

      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
      const result = await this.executeQuery<ServerNetworkTable[]>({ sql: query, params: systemNames, request: "findBySystemNames" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemNames", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findBySystemNames",
        message: "[시스템 이름으로 네트워크 정보 조회] - 오류가 발생했습니다",
      })
    }
  }
}
