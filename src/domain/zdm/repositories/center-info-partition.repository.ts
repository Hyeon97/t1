import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
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
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemNames", state: "start" })
      if (systemNames.length === 0) {
        return []
      }
      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
      const result = await this.executeQuery<ZdmInfoPartitionTable[]>({ sql: query, params: systemNames, request: "findBySystemNames" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemNames", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findBySystemNames",
        message: "[ZDM 이름으로 파티션 정보 조회] - 오류가 발생했습니다",
      })
    }
  }
}
