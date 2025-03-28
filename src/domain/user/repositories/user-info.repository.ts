import { executeQuery, executeQuerySingle } from "../../../database/connection"
import { UserInfoTable } from "../interface/db/user_info"

export class UserInfoRepository {
  private readonly tableName = "user_info"
  /**
   * 모든 사용자 조회
   */
  async findAll(): Promise<UserInfoTable[]> {
    const query = `SELECT * FROM ${this.tableName}`
    const users = await executeQuery<UserInfoTable>({ sql: query })
    return users
  }

  /**
   * ID로 단일 사용자 조회
   */
  async findById({ id }: { id: number }): Promise<UserInfoTable | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE idx=?`
    const params = [id]
    const user = await executeQuerySingle<UserInfoTable>({ sql: query, params })
    return user
  }

  /**
   * email, password로 사용자 조회
   */
  async findByEmailAndPassword({ email, password }: { email: string; password: string }): Promise<UserInfoTable | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email=? and password=?`
    const params = [email, password]
    const user = await executeQuerySingle<UserInfoTable>({ sql: query, params })
    return user
  }

  /**
   * 이메일로 단일 사용자 조회
   */
  async findByEmail({ email }: { email: string }): Promise<UserInfoTable | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email=?`
    const params = [email]
    const user = await executeQuerySingle<UserInfoTable>({ sql: query, params })
    return null
    return user
  }
}
