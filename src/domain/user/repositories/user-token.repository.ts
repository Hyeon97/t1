import { ResultSetHeader } from "mysql2"
import { TransactionManager } from "../../../database/connection"
import { BaseRepository, SqlFieldOption } from "../../../utils/base/base-repository"
import { TokenDBInput } from "../../auth/interface/token"
import { asyncContextStorage } from "../../../utils/AsyncContext"

export class UserTokenRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "UserTokenRepository",
      tableName: "user_token",
    })
  }

  /**
   * token 정보 저장
   */
  async saveTokenInfo({ saveData, transaction }: { saveData: TokenDBInput; transaction: TransactionManager }): Promise<ResultSetHeader> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "saveTokenInfo", state: "start" })
      // 시간 필드에 대한 SQL 함수 사용 옵션 정의
      const sqlOptions: Record<string, SqlFieldOption> = {
        sIssue_Date: { raw: "now()" },
        sLast_Use_Date: { raw: "now()" },
      }
      const result = await this.insert({
        data: saveData,
        options: sqlOptions,
        transaction,
        request: `${this.repositoryName}.saveTokenInfo`,
      })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "saveTokenInfo", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "saveTokenInfo",
        message: "[Token 정보 저장] - 오류가 발생했습니다",
      })
    }
  }
}
