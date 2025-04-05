import { OSTypeMap } from "../../../types/common/os"
import { RepositoryTypeMap } from "../../../types/common/repository"
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
  private applyFilters(filterOptions: ZdmRepositoryFilterOptions): void {
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
  }

  /**
   *  모든 레포지토리 조회
   */
  async findAll({ filterOptions }: { filterOptions: ZdmRepositoryFilterOptions }): Promise<ZdmRepositoryTable[]> {
    try {
      this.resetQueryState()
      this.applyFilters(filterOptions)
      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      return await this.executeQuery<ZdmRepositoryTable>({ sql: query, params: this.params, request: "findAll" })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmRepositoryRepository.findAll() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 특정 레포지토리 조회
   */
  async findById({ id, filterOptions }: { id: number; filterOptions: ZdmRepositoryFilterOptions }): Promise<ZdmRepositoryTable | null> {
    try {
      this.resetQueryState()
      this.addCondition({ condition: "nID = ?", params: [id] })
      this.applyFilters(filterOptions)
      let query = `SELECT * FROM ${this.tableName}`
      query += this.buildWhereClause()
      return await this.executeQuerySingle<ZdmRepositoryTable>({ sql: query, params: this.params, request: "findById" })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmRepositoryRepository.findById() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 특정 센터에 등록된 레포지토리 정보 조회
   */
  async findBySystemNames({ systemNames }: { systemNames: string[] }): Promise<ZdmRepositoryTable[]> {
    try {
      if (systemNames.length === 0) {
        return []
      }
      const placeholders = systemNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
      return await this.executeQuery<ZdmRepositoryTable>({ sql: query, params: systemNames, request: "findBySystemNames" })
    } catch (error) {
      ContextLogger.debug({
        message: `ZdmRepositoryRepository.findBySystemNames() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
