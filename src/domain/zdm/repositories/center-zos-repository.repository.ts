import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../utils/regex.utils"
import { ZdmRepositoryTable } from "../types/db/center-repository"
import { ZdmRepositoryFilterOptions } from "../types/zdm-repository/zdm-repository-filter.type"
import { ZdmZosRepositoryFilterOptions } from "../types/zdm-zos-repository/zdm-zos-repository.filter.type"

export class ZdmZosRepositoryRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ZdmZosRepository",
      tableName: "center_zos_repository",
    })
  }
  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions?: ZdmZosRepositoryFilterOptions }): void {
    try {
      if (!filterOptions) return
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
      //  center 필터 적용
      if (filterOptions.center) {
        if (regNumberOnly.test(filterOptions.center)) {
          //  숫자만 > Center ID
          this.addCondition({ condition: "nCenterID = ?", params: [filterOptions.center] })
        }
        else {
          this.addCondition({ condition: "sSystemName = ?", params: [filterOptions.center] })
        }
      }
      //  bucket 이름 필터 적용
      if (filterOptions.bucketName) {
        this.addCondition({ condition: "sBucketName = ?", params: [filterOptions.bucketName] })
      }
      //  platform 필터 적용
      if (filterOptions.platform) {
        if (regNumberOnly.test(filterOptions.platform)) {

        }
        this.addCondition({ condition: "sCloudPlatform = ?", params: [filterOptions.platform] })
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
