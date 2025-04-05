import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ZdmInfoNetworkTable } from "../types/db/center-info-network"

export class ZdmNetworkRepository extends BaseRepository {
  protected readonly tableName = "center_info_network"
  constructor() {
    super({
      repositoryName: "ZdmNetworkRepository",
      tableName: "center_info_network",
    })
  }
  /**
   * 특정 시스템 이름을 가진 ZDM들의 디스크 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ZdmInfoNetworkTable[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }
      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`

      return await this.executeQuery<ZdmInfoNetworkTable>({ sql: query, params: systemNames, request: "findBySystemNames" })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmNetworkRepository.findBySystemNames() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
