import { BaseRepository } from "../../../utils/base/base-repository"
import { ServerNetworkTable } from "../types/db/server-network"

export class ServerNetworkRepository extends BaseRepository {
  constructor() {
    super({
      tableName: "server_network",
      entityName: "ServerNetwork",
    })
  }

  /**
   * 특정 시스템 이름을 가진 서버들의 네트워크 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ServerNetworkTable[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }

      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`

      return await this.executeQuery<ServerNetworkTable>({ sql: query, params: systemNames })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        functionName: "findBySystemNames",
        message: "시스템 이름으로 네트워크 정보 조회 중 오류가 발생했습니다",
      })
    }
  }
}
