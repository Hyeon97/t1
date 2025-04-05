import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ZdmInfoPartitionTable } from "../types/db/center-info-partition"

export class ZdmPartitionRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ZdmPartitionRepository",
      tableName: "center_info_partition",
    })
  }
  /**
   * 특정 시스템 이름을 가진 ZDM들의 디스크 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ZdmInfoPartitionTable[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }
      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`

      return await this.executeQuery<ZdmInfoPartitionTable>({ sql: query, params: systemNames, request: "findBySystemNames" })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmPartitionRepository.findBySystemNames() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
