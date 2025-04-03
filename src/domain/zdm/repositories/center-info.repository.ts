import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { logger } from "../../../utils/logger/logger.util"
import { ZdmInfoTable } from "../types/db/center-info"
import { ZdmFilterOptions } from "../types/zdm/zdm-filter.type"

export class ZdmRepository extends BaseRepository {
  constructor() {
    super({
      tableName: "center_info",
      entityName: "CenterInfo",
    })
  }
  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions: ZdmFilterOptions }): void {}

  /**
   *  모든 ZDM 조회
   */
  async findAll({ filterOptions }: { filterOptions: ZdmFilterOptions }): Promise<ZdmInfoTable[]> {
    try {
      this.resetQueryState()
      this.applyFilters({ filterOptions })

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      return await this.executeQuery<ZdmInfoTable>({ sql: query, params: this.params })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmRepository.findAll() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 특정 ZDM 조회 ( by Name )
   */
  async findByZdmName({ name, filterOptions }: { name: string; filterOptions: ZdmFilterOptions }): Promise<ZdmInfoTable | null> {
    try {
      this.resetQueryState()
      this.addCondition({ condition: "sZdmName = ?", params: [name] })
      this.applyFilters({ filterOptions })

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      return await this.executeQuerySingle<ZdmInfoTable>({ sql: query, params: this.params, functionName: "findByZdmName" })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmRepository.findByZDMName() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 특정 ZDM 조회 ( By ID )
   */
  async findByZdmId({ id, filterOptions }: { id: number; filterOptions: ZdmFilterOptions }): Promise<ZdmInfoTable | null> {
    try {
      this.resetQueryState()
      this.addCondition({ condition: "nID = ?", params: [id] })
      this.applyFilters({ filterOptions })

      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      logger.debug(`실행 쿼리: ${query}, 파라미터: ${this.params.join(", ")}`)
      return await this.executeQuerySingle<ZdmInfoTable>({ sql: query, params: this.params, functionName: "findByZdmId" })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmRepository.findByZDMId() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
