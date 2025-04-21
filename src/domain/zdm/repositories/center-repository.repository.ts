import { OSTypeMap } from "../../../types/common/os"
import { RepositoryTypeMap } from "../../../types/common/repository"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ZdmRepositoryTable } from "../types/db/center-repository"
import { ZdmRepositoryFilterOptions } from "../types/zdm-repository/zdm-repository-filter.type"

export class ZdmRepositoryRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ZdmRepository",
      tableName: "center_repository",
    })
  }
  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions?: ZdmRepositoryFilterOptions }): void {
    try {
      if (!filterOptions) return
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
      //  center 필터 적용
      //  filterOptions.center 값이 center name 인 경우 별도 처리 필요 ( center 정보 가져와야 함 )
      if (filterOptions.center) {
        this.addCondition({ condition: "nCenterID = ?", params: [filterOptions.center] })
      }
      // OS 필터 적용
      if (filterOptions.os) {
        const os = filterOptions.os === "win" ? "window" : "linux"
        this.addCondition({ condition: "nOS = ?", params: [OSTypeMap.fromString({ str: os })] })
      }
      //  타입 필터 적용
      if (filterOptions.type) {
        this.addCondition({ condition: "nType = ?", params: [RepositoryTypeMap.fromString({ str: filterOptions.type })] })
      }
      //  path 필터 적용
      if (filterOptions.path) {
        this.addCondition({ condition: "sRemotePath = ?", params: [filterOptions.path] })
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
   *  모든 레포지토리 조회
   */
  async findAll({ filterOptions }: { filterOptions?: ZdmRepositoryFilterOptions }): Promise<ZdmRepositoryTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })

      this.resetQueryState()
      this.applyFilters({ filterOptions })
      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<ZdmRepositoryTable[]>({ sql: query, params: this.params, request: "findAll" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findBySystemNames",
        message: "[레포지토리 정보 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 특정 레포지토리 조회 ( by ID )
   */
  async findById({ id, filterOptions }: { id: number; filterOptions?: ZdmRepositoryFilterOptions }): Promise<ZdmRepositoryTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findById", state: "start" })

      this.resetQueryState()
      this.addCondition({ condition: "nID = ?", params: [id] })
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuerySingle<ZdmRepositoryTable>({ sql: query, params: this.params, request: "findById" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findById", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findById",
        message: "[ZDM 이름으로 레포지토리 정보 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 특정 센터에 등록된 레포지토리 정보 조회 ( by name )
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ZdmRepositoryTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemNames", state: "start" })

      if (systemNames.length === 0) {
        return []
      }
      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
      const result = await this.executeQuery<ZdmRepositoryTable[]>({ sql: query, params: systemNames, request: "findBySystemNames" })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findBySystemNames", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findBySystemNames",
        message: "[ZDM 이름으로 Repository 정보 조회] - 오류가 발생했습니다",
      })
    }
  }
}
