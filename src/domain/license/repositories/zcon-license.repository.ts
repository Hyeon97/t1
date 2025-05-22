import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { DateTimeUtils } from "../../../utils/Dayjs.utils"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { ZconLicenseTable } from "../types/db/zcon_license"
import { LicenseTypeMap } from "../types/license-common.type"
import { LicenseFilterOptions } from "../types/license-get.type"

export class ZconLicenseRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "ZconLicenseRepository",
      tableName: "zcon_license",
    })
  }

  /**
   * 필터 옵션 적용
   */
  private applyFilters({ filterOptions }: { filterOptions?: LicenseFilterOptions }): any {
    try {
      if (!filterOptions) return
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilterOptions", state: "start" })
      //  category 필터 적용
      if (filterOptions.category) {
        const category = LicenseTypeMap.fromString({ str: filterOptions.category })
        this.addCondition({ condition: "nLicenseCategory = ?", params: [category] })
      }
      //  exp 필터 적용
      if (filterOptions.exp) {
        const current = filterOptions.exp
        const nextDay = DateTimeUtils.getNextDay({ date: current })
        this.addCondition({ condition: "(sLicenseExpirationDate >= ? AND sLicenseExpirationDate < ?)", params: [current, nextDay] })
      }
      //  created 필터 적용
      if (filterOptions.created) {
        const current = filterOptions.created
        const nextDay = DateTimeUtils.getNextDay({ date: current })
        this.addCondition({ condition: "(sLicenseCreateDate >= ? AND sLicenseCreateDate < ?)", params: [current, nextDay] })
      }
      ContextLogger.debug({ message: `필터 옵션 적용됨` })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "applyFilterOptions", state: "end" })
    } catch (error) {
      this.handleRepositoryError({
        error,
        method: "applyFilters",
        message: "[필터 옵션 적용] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 모든 License 정보 조회
   */
  async findAll({ filterOptions }: { filterOptions?: LicenseFilterOptions }): Promise<any> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })

      this.resetQueryState()
      this.applyFilters({ filterOptions })

      const query = `SELECT * FROM ${this.tableName} ${this.buildWhereClause()}`
      const result = await this.executeQuery<ZconLicenseTable[]>({ sql: query, params: this.params, request: `${this.repositoryName}.findAll` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[License 정보 조회] - License 정보 조회 중 에러 발생",
      })
    }
  }
}