import { ResultSetHeader } from "mysql2"
import { executeQuerySingle } from "../../../database/connection"
import { ApiError } from "../../../errors/ApiError"
import { CommonRepository } from "../../../types/common/repository"
import { TokenDBInput } from "../../auth/interface/token"

export class UserTokenRepository extends CommonRepository {
  protected readonly tableName = "user_token"
  /**
   * token 정보 저장
   */
  async saveTokenInfo({ input }: { input: TokenDBInput }): Promise<void> {
    try {
      const fieldsList = ["sToken", "sMail", "sIssue_Date", "sLast_Use_Date"].join(", ")
      const placeholders = ["?", "?", "now()", "now()"]
      const query = `INSERT INTO ${this.tableName} (${fieldsList}) VALUES (${placeholders})`
      const params = [input.token, input.mail]
      await executeQuerySingle<ResultSetHeader>({ sql: query, params })
    } catch (error) {
      throw ApiError.databaseError({ message: "token 정보 저장 중에 오류 발생했습니다" })
    }
  }
}
