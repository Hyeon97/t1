import { ResultSetHeader } from "mysql2"
import { TransactionManager } from "../../../database/connection"
import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository, SqlFieldOption } from "../../../utils/base/base-repository"
import { LicenseHistoryTableInput } from "../types/license-history.type"

export class LicenseHistoryRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "LicenseHistoryRepository",
      tableName: "zcon_license_history",
    })
  }

  /**
   * 등록
   */
  async insertHistory({ data, transaction }: { data: LicenseHistoryTableInput, transaction: TransactionManager }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByName", state: "start" })

      // 시간 필드에 대한 SQL 함수 사용 옵션 정의
      const sqlOptions: Record<string, SqlFieldOption> = {
        sUpdateTime: { raw: "now()" },
      }

      const result = await this.insert({
        data, options: sqlOptions, transaction, request: `${this.repositoryName}.insertHistory`
      })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByName", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "insertHistory",
        message: "[License History 등록] - License History 등록 중 에러 발생",
      })
    }
  }
}