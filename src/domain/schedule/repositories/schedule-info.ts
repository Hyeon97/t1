import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ScheduleInfoTable } from "../types/db/schedule-info"
import { ScheduleStatusMap, ScheduleTypeMap } from "../types/schedule-common.type"
import { ScheduleFilterOptions } from "../types/schedule-filter.type"

export class ScheduleRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ScheduleRepository",
      tableName: "schedule_info",
    })
  }

  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions?: ScheduleFilterOptions }): void {
    try {
      if (!filterOptions) return
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilters", state: "start" })
      //  type 필터 적용
      if (filterOptions.type) {
        this.addCondition({ condition: "nScheduleType = ?", params: [ScheduleTypeMap.fromString({ str: filterOptions.type })] })
      }
      //  state 필터 적용
      if (filterOptions.state) {
        this.addCondition({ condition: "nStatus = ?", params: [ScheduleStatusMap.fromString({ str: filterOptions.state })] })
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
   * 모든 Schedule 조회
   */
  async findAll({ filterOptions }: { filterOptions?: ScheduleFilterOptions }): Promise<ScheduleInfoTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })

      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<ScheduleInfoTable[]>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[Schedule 목록 조회] - 오류가 발생했습니다",
      })
    }
  }
}
