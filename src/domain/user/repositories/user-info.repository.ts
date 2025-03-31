import { executeQuery, executeQuerySingle } from "../../../database/connection"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { UserInfoTable } from "../types/db/user_info"

export class UserInfoRepository {
  private readonly tableName = "user_info"
  /**
   * 모든 사용자 조회
   */
  async findAll(): Promise<UserInfoTable[]> {
    try {
      const query = `SELECT * FROM ${this.tableName}`

      return await executeQuery<UserInfoTable>({ sql: query })
    } catch (error) {
      ContextLogger.debug({
        message: `UserInfoRepository.findAll() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * ID로 단일 사용자 조회
   */
  async findById({ id }: { id: number }): Promise<UserInfoTable | null> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE idx=?`
      const params = [id]

      return await executeQuerySingle<UserInfoTable>({ sql: query, params })
    } catch (error) {
      ContextLogger.debug({
        message: `UserInfoRepository.findById() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * email, password로 사용자 조회
   */
  async findByEmailAndPassword({ email, password }: { email: string; password: string }): Promise<UserInfoTable | null> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE email=? and password=?`
      const params = [email, password]

      return await executeQuerySingle<UserInfoTable>({ sql: query, params })
    } catch (error) {
      ContextLogger.debug({
        message: `UserInfoRepository.findByEmailAndPassword() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }

  /**
   * 이메일로 단일 사용자 조회
   */
  async findByEmail({ email }: { email: string }): Promise<UserInfoTable | null> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE email=?`
      const params = [email]

      return await executeQuerySingle<UserInfoTable>({ sql: query, params })
    } catch (error) {
      ContextLogger.debug({
        message: `UserInfoRepository.findByEmail() 오류 발생`,
        meta: {
          error: error instanceof Error ? error.message : String(error),
        },
      })
      throw error
    }
  }
}
