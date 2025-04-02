import { executeQuery, executeQuerySingle } from "../../../database/connection"
import { OSTypeMap } from "../../../types/common/os"
import { RepositoryTypeMap } from "../../../types/common/repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { logger } from "../../../utils/logger/logger.util"
import { CommonRepository } from "../../../utils/repository.utils"
import { ZdmRepositoryTable } from "../types/db/center-repository"
import { ZdmRepositoryFilterOptions } from "../types/zdm-repository/zdm-repository-filter.type"

export class ZdmRepositoryRepository extends CommonRepository {
  protected readonly tableName = "center_repository"
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
      return await executeQuery<ZdmRepositoryTable>({ sql: query, params: this.params })
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
      return await executeQuerySingle<ZdmRepositoryTable>({ sql: query, params: this.params })
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
  async findBySystemNames({ centerNames }: { centerNames: string[] }): Promise<ZdmRepositoryTable[]> {
    try {
      if (centerNames.length === 0) {
        return []
      }
      const placeholders = centerNames.map(() => "?").join(",")
      const query = `SELECT * FROM ${this.tableName} WHERE sSystemName IN (${placeholders})`
      return await executeQuery<ZdmRepositoryTable>({ sql: query, params: centerNames })
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
