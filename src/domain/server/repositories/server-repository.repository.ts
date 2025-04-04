import { BaseRepository } from "../../../utils/base/base-repository"
import { ServerRepositoryTable } from "../types/db/server-repository"

export class ServerRepositoryRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ServerRepositoryRepository",
      tableName: "server_repository",
    })
  }

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

      return await this.executeQuery<ServerRepositoryTable>({ sql: query, params: systemNames, functionName: "findBySystemNames" })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        functionName: "findBySystemNames",
        message: "시스템 이름으로 레포지토리 정보 조회 중 오류가 발생했습니다",
      })
    }
  }
}
