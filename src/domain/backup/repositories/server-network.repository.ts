import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerNetworkTable } from "../../server/types/db/server-network"

export class ServerNetworkRepository extends BaseRepository {
  protected readonly tableName = "server_network"
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
      ContextLogger.debug({
        message: `ServerNetworkRepository.findBySystemNames() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
