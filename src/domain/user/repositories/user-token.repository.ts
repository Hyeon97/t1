import { ResultSetHeader } from "mysql2"
import { BaseRepository } from "../../../utils/base/base-repository"
import { TokenDBInput } from "../../auth/interface/token"

export class UserTokenRepository extends BaseRepository {
  constructor() {
    super({
      tableName: "user_token",
      entityName: "UserToken",
    })
  }
  /**
   * token 정보 저장
   */
  async saveTokenInfo({ input }: { input: TokenDBInput }): Promise<void> {
    const fieldsList = ["sToken", "sMail", "sIssue_Date", "sLast_Use_Date"].join(", ")
    const placeholders = ["?", "?", "now()", "now()"]
    const query = `INSERT INTO ${this.tableName} (${fieldsList}) VALUES (${placeholders})`
    const params = [input.token, input.mail]
    await this.executeQuerySingle<ResultSetHeader>({ sql: query, params, functionName: "saveTokenInfo" })
  }
}
