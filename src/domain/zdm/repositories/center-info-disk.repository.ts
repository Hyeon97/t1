import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ZdmInfoDiskTable } from "../types/db/center-info-disk"

export class ZdmDiskRepository extends BaseRepository {
  protected readonly tableName = "center_info_disk"
  constructor() {
    super({
      repositoryName: "ZdmDiskRepository",
      tableName: "center_info_disk",
    })
  }
  /**
   * 특정 시스템 이름을 가진 ZDM들의 디스크 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ZdmInfoDiskTable[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }
      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`

      return await this.executeQuery<ZdmInfoDiskTable>({ sql: query, params: systemNames, functionName: "findBySystemNames" })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmDiskRepository.findBySystemNames() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
