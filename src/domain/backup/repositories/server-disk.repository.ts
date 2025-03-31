import { executeQuery } from "../../../database/connection"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { CommonRepository } from "../../../utils/repository.utils"
import { ServerDiskTable } from "../types/db/server-disk"

export class ServerDiskRepository extends CommonRepository {
  protected readonly tableName = "server_disk"

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

      return await executeQuery<ServerDiskTable>({ sql: query, params: systemNames })
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
