import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ZdmInfoTable } from "../types/db/center-info"
import { ZdmFilterOptions } from "../types/zdm/zdm-filter.type"

export class ZdmRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ZdmRepository",
      tableName: "center_info",
    })
  }
  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions?: ZdmFilterOptions }): void {
    asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
    asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "end" })
  }

  /**
   *  모든 ZDM 조회
   */
  async findAll({ filterOptions }: { filterOptions: ZdmFilterOptions }): Promise<ZdmInfoTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })
      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<ZdmInfoTable[]>({ sql: query, params: this.params, request: "findAll" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[ZDM 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 특정 ZDM 조회 ( by ZDM ID )
   */
  async findByZdmIds({ ids, filterOptions }: { ids: number[]; filterOptions?: ZdmFilterOptions }): Promise<ZdmInfoTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByZdmIds", state: "start" })

      if (ids.length === 0) {
        return []
      }
      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const placeholders = ids.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE nID IN (${placeholders})`
      const result = await this.executeQuery<ZdmInfoTable[]>({ sql: query, params: ids, request: `${this.repositoryName}.findByZdmIds` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByZdmIds", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByZdmIds",
        message: `[ZDM ID로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 ZDM 조회 ( by Name )
   */
  async findByZdmName({ name, filterOptions }: { name: string; filterOptions?: ZdmFilterOptions }): Promise<ZdmInfoTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByZdmName", state: "start" })
      this.resetQueryState()
      this.addCondition({ condition: "sCenterName = ?", params: [name] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuerySingle<ZdmInfoTable>({ sql: query, params: this.params, request: "findByZdmName" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByZdmName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByZdmName",
        message: `[ZDM 이름으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 ZDM 조회 ( By ID )
   */
  async findByZdmId({ id, filterOptions }: { id: number; filterOptions?: ZdmFilterOptions }): Promise<ZdmInfoTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByZdmId", state: "start" })
      this.resetQueryState()
      this.addCondition({ condition: "nID = ?", params: [id] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuerySingle<ZdmInfoTable>({ sql: query, params: this.params, request: "findByZdmId" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByZdmId", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByZdmId",
        message: `[ZDM ID로 조회] - 오류가 발생했습니다`,
      })
    }
  }
}
