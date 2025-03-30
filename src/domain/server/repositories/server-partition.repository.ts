import { executeQuery } from "../../../database/connection"
import { CommonRepository } from "../../../types/common/repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../utils/regex.utils"
import { ServerPartitionTable } from "../types/db/server-partition"
import { ServerPartitionFilterOptions } from "../types/server-partition-filter-type"

export class ServerPartitionRepository extends CommonRepository {
  protected readonly tableName = "server_partition"

  /**
   * 필터 옵션 적용
   */
  private applyFilters(filterOptions: ServerPartitionFilterOptions): void {
    //  server 필터 적용
    //  filterOptions.server 값이 server name 인 경우 별도 처리 필요 ( server 정보 가져와야 함 )
    if (filterOptions.server) {
      if (typeof filterOptions.server === "number" || regNumberOnly.test(filterOptions.server as string))
        this.addCondition({ condition: "sSystemName = ?", params: [filterOptions.server] })
    }
  }

  /**
   *  모든 파티션 조회
   */
  async findAll({ filterOptions }: { filterOptions: ServerPartitionFilterOptions }): Promise<ServerPartitionTable[]> {
    try {
      this.resetQueryState()
      this.applyFilters(filterOptions)
      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()

      return await executeQuery<ServerPartitionTable>({ sql: query, params: this.params })
    } catch (error) {
      ContextLogger.debug({
        message: `ServerPartitionRepository.findAll() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 특정 시스템 이름을 가진 서버들의 파티션 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ServerPartitionTable[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }

      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`

      return await executeQuery<ServerPartitionTable>({ sql: query, params: systemNames })
    } catch (error) {
      ContextLogger.debug({
        message: `ServerPartitionRepository.findBySystemNames() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 특정 서버의 파티션 목록 조회
   */
  async findByServerName({ name, filterOptions }: { name: string; filterOptions: ServerPartitionFilterOptions }): Promise<ServerPartitionTable[]> {
    try {
      this.resetQueryState()
      this.addCondition({ condition: "sSystemName = ?", params: [name] })
      this.applyFilters(filterOptions)
      let query = `SELECT * FROM ${this.tableName}`

      return await executeQuery<ServerPartitionTable>({ sql: query, params: this.params })
    } catch (error) {
      ContextLogger.debug({
        message: `ServerPartitionRepository.findByServerName() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
