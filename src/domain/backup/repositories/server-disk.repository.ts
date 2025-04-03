import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerDiskTable } from "../../server/types/db/server-disk"

export class ServerDiskRepository extends BaseRepository {
  constructor() {
    super({
      tableName: "server_disk",
      entityName: "ServerDisk",
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

      return await this.executeQuery<ServerDiskTable>({ sql: query, params: systemNames })
    } catch (error) {
      ContextLogger.debug({
        message: `ServerDiskRepository.findBySystemNames() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
