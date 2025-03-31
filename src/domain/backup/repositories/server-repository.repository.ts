import { executeQuery } from "../../../database/connection"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { CommonRepository } from "../../../utils/repository.utils"
import { ServerRepositoryTable } from "../types/db/server-repository"

export class ServerRepositoryRepository extends CommonRepository {
  protected readonly tableName = "server_repository"

  /**
   * 특정 시스템 이름을 가진 서버들의 레포지토리 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ServerRepositoryTable[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }
      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`

      return await executeQuery<ServerRepositoryTable>({ sql: query, params: systemNames })
    } catch (error) {
      ContextLogger.debug({
        message: `ServerRepositoryRepository.findBySystemNames() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
