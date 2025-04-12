import { OSTypeMap } from "../../../types/common/os"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ServerBasicTable } from "../types/db/server-basic"
import { SystemModeMap } from "../types/server-common.type"
import { ServerFilterOptions } from "../types/server-filter.type"

export class ServerBasicRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ServerBasicRepository",
      tableName: "server_basic",
    })
  }

  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions: ServerFilterOptions }): void {
    try {
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
      // OS 필터 적용
      if (filterOptions.os) {
        this.addCondition({
          condition: "nOS = ?",
          params: [OSTypeMap.fromString({ str: filterOptions.os })],
        })
      }

      // 상태 필터 적용
      if (filterOptions.connection) {
        this.addCondition({
          condition: "sStatus = ?",
          params: [filterOptions.connection],
        })
      }

      // 시스템 모드 필터 적용
      if (filterOptions.mode) {
        this.addCondition({
          condition: "nSystemMode = ?",
          params: [SystemModeMap.fromString({ str: filterOptions.mode })],
        })
      }

      // 라이센스 필터 적용
      if (filterOptions.license) {
        const condition = filterOptions.license === "assign" ? "nLicenseID > 0" : "nLicenseID = 0"
        this.addRawCondition({ condition })
      }
      ContextLogger.debug({ message: `필터 옵션 적용됨` })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "end" })
    } catch (error) {
      this.handleRepositoryError({
        error,
        method: "applyFilters",
        message: "[필터 옵션 적용] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 모든 서버 조회
   */
  async findAll({ filterOptions }: { filterOptions: ServerFilterOptions }): Promise<ServerBasicTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })
      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<ServerBasicTable[]>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[서버 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 특정 서버 조회 ( by Name )
   */
  async findByServerName({ name, filterOptions }: { name: string; filterOptions: ServerFilterOptions }): Promise<ServerBasicTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByServerName", state: "start" })
      this.resetQueryState()
      this.addCondition({ condition: "sSystemName = ?", params: [name] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuerySingle<ServerBasicTable>({
        sql: query,
        params: this.params,
        request: `${this.repositoryName}.findByServerName`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByServerName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByServerName",
        message: `[서버 이름으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * 특정 서버 조회 ( By ID )
   */
  async findByServerId({ id, filterOptions }: { id: number; filterOptions: ServerFilterOptions }): Promise<ServerBasicTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByServerId", state: "start" })
      this.resetQueryState()
      this.addCondition({ condition: "nID = ?", params: [id] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuerySingle<ServerBasicTable>({
        sql: query,
        params: this.params,
        request: `${this.repositoryName}.findByServerId`,
      })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByServerId", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findByServerId",
        message: `[서버 ID로 조회] - 오류가 발생했습니다`,
      })
    }
  }
}
