import { executeQuery, executeQuerySingle } from "../../../database/connection"
import { OSTypeMap } from "../../../types/common/os"
import { CommonRepository } from "../../../types/common/repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerBasicTable } from "../types/db/server-basic"
import { SystemModeMap } from "../types/server-common.type"
import { ServerFilterOptions } from "../types/server-filter.type"

export class ServerBasicRepository extends CommonRepository {
  protected readonly tableName = "server_basic"

  /**
   * 필터 옵션 적용
   */
  private applyFilters(filterOptions: ServerFilterOptions): void {
    // OS 필터 적용
    if (filterOptions.os) {
      this.addCondition({ condition: "nOS = ?", params: [OSTypeMap.fromString({ str: filterOptions.os })] })
    }
    // 상태 필터 적용
    if (filterOptions.connection) {
      this.addCondition({ condition: "sStatus = ?", params: [filterOptions.connection] })
    }
    // 시스템 모드 필터 적용
    if (filterOptions.mode) {
      this.addCondition({ condition: "nSystemMode = ?", params: [SystemModeMap.fromString({ str: filterOptions.mode })] })
    }
    // 라이센스 필터 적용
    if (filterOptions.license) {
      const condition = filterOptions.license === "assign" ? "nLicenseID > 0" : "nLicenseID = 0"
      this.addRawCondition({ condition })
    }
    ContextLogger.debug({ message: `필터 옵션 적용됨` })
  }

  /**
   * 모든 서버 조회
   */
  async findAll({ filterOptions }: { filterOptions: ServerFilterOptions }): Promise<ServerBasicTable[]> {
    try {
      this.resetQueryState()
      this.applyFilters(filterOptions)

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      return await executeQuery<ServerBasicTable>({ sql: query, params: this.params })
    } catch (error) {
      ContextLogger.debug({
        message: `ServerBasicRepository.findAll() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 특정 서버 조회
   */
  async findByServerName({ name, filterOptions }: { name: string; filterOptions: ServerFilterOptions }): Promise<ServerBasicTable | null> {
    try {
      this.resetQueryState()
      this.addCondition({ condition: "sSystemName = ?", params: [name] })
      this.applyFilters(filterOptions)

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      return await executeQuerySingle<ServerBasicTable>({ sql: query, params: this.params })
    } catch (error) {
      ContextLogger.debug({
        message: `ServerBasicRepository.findByServerName() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 특정 서버 조회
   */
  async findByServerId({ id, filterOptions }: { id: number; filterOptions: ServerFilterOptions }): Promise<ServerBasicTable | null> {
    try {
      this.resetQueryState()
      this.addCondition({ condition: "nID = ?", params: [id] })
      this.applyFilters(filterOptions)

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      return await executeQuerySingle<ServerBasicTable>({ sql: query, params: this.params })
    } catch (error) {
      ContextLogger.debug({
        message: `ServerBasicRepository.findByServerId() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
