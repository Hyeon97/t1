import { executeQuery } from "../../../database/connection"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { CommonRepository } from "../../../utils/repository.utils"
import { ZdmInfoNetworkTable } from "../types/db/center-info-network"

export class ZdmNetworkRepository extends CommonRepository {
  protected readonly tableName = "center_info_network"

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

      return await executeQuery<ZdmInfoNetworkTable>({ sql: query, params: systemNames })
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
