import { ResultSetHeader } from "mysql2"
import { TransactionManager } from "../../../database/connection"
import { BaseRepository, SqlFieldOption } from "../../../utils/base/base-repository"
import { TokenDBInput } from "../../auth/interface/token"

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
      // 시간 필드에 대한 SQL 함수 사용 옵션 정의
      const sqlOptions: Record<string, SqlFieldOption> = {
        sIssue_Date: { raw: "now()" },
        sLast_Use_Date: { raw: "now()" },
      }

      return await this.insert({
        data: saveData,
        options: sqlOptions,
        transaction,
        request: `${this.repositoryName}.saveTokenInfo`,
      })
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "saveTokenInfo",
        message: "Token 정보 저장 중 오류가 발생했습니다",
      })
    }
  }
}
