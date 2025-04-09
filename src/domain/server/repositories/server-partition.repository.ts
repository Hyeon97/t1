import { BaseRepository } from "../../../utils/base/base-repository"
import { ServerPartitionTable } from "../types/db/server-partition"
import { ServerPartitionFilterOptions } from "../types/server-partition-filter.type"

export class ServerPartitionRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ServerPartitionRepository",
      tableName: "server_partition",
    })
  }

  /**
   * 필터 옵션 적용
   */
  private applyFilters(filterOptions: ServerPartitionFilterOptions): void {
    try {
      //  server 필터 적용
      //  두번째 조건은 findByServerName함수로 인한 중복 처리 방지
      if (filterOptions.server && !this.conditions.includes("sSystemName = ?")) {
        this.addCondition({ condition: "sSystemName = ?", params: [filterOptions.server] })
        // if (typeof filterOptions.server === "number" || regNumberOnly.test(filterOptions.server as string)) {
        //   this.addCondition({ condition: "sSystemName = ?", params: [filterOptions.server] })
        // } else {
        //   this.addCondition({ condition: "sSystemName = ?", params: [filterOptions.server] })
        // }
      }
    } catch (error) {
      this.handleRepositoryError({
        error,
        functionName: "applyFilters",
        message: "Server Partition 필터 옵션 적용 중 오류가 발생했습니다",
      })
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

      return await this.executeQuery<ServerPartitionTable[]>({ sql: query, params: this.params, request: "findAll" })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        functionName: "findAll",
        message: "모든 파티션 정보 조회 중 오류가 발생했습니다",
      })
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

      return await this.executeQuery<ServerPartitionTable[]>({ sql: query, params: systemNames, request: "findBySystemNames" })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        functionName: "findBySystemNames",
        message: "시스템 이름으로 파티션 정보 조회 중 오류가 발생했습니다",
      })
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
      query += this.buildWhereClause()

      return await this.executeQuery<ServerPartitionTable[]>({ sql: query, params: this.params, request: "findByServerName" })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        functionName: "findByServerName",
        message: `서버 이름(${name})으로 파티션 정보 조회 중 오류가 발생했습니다`,
      })
    }
  }
}
