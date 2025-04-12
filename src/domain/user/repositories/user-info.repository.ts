import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseRepository } from "../../../utils/base/base-repository"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { UserInfoTable } from "../types/db/user_info"

export class UserInfoRepository extends BaseRepository {
  constructor() {
    super({
      repositoryName: "UserInfoRepository",
      tableName: "user_info",
    })
  }
  /**
   * 모든 사용자 조회
   */
  async findAll(): Promise<UserInfoTable[]> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "start" })

      const query = `SELECT * FROM ${this.tableName}`
      const result = await this.executeQuery<UserInfoTable[]>({ sql: query, request: `${this.repositoryName}.findAll` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findAll", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findAll",
        message: "[User 목록 조회] - 오류가 발생했습니다",
      })
      // ContextLogger.debug({
      //   message: `UserInfoRepository.findAll() 오류 발생`,
      //   meta: {
      //     error: error instanceof Error ? error.message : String(error),
      //   },
      // })
      // throw error
    }
  }

  /**
   * ID로 단일 사용자 조회
   */
  async findById({ id }: { id: number }): Promise<UserInfoTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findById", state: "start" })

      const query = `SELECT * FROM ${this.tableName} WHERE idx=?`
      const params = [id]
      const result = await this.executeQuerySingle<UserInfoTable>({ sql: query, params, request: `${this.repositoryName}.findById` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findById", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findById",
        message: "[User ID로 조회] - 오류가 발생했습니다",
      })
      // ContextLogger.debug({
      //   message: `UserInfoRepository.findById() 오류 발생`,
      //   meta: {
      //     error: error instanceof Error ? error.message : String(error),
      //   },
      // })
      // throw error
    }
  }

  /**
   * email, password로 사용자 조회
   */
  async findByEmailAndPassword({ email, password }: { email: string; password: string }): Promise<UserInfoTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByEmailAndPassword", state: "start" })

      const query = `SELECT * FROM ${this.tableName} WHERE email=? and password=?`
      const params = [email, password]
      const result = await this.executeQuerySingle<UserInfoTable>({ sql: query, params, request: `${this.repositoryName}.findByEmailAndPassword` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByEmailAndPassword", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findById",
        message: "[User Mail, Password로 조회] - 오류가 발생했습니다",
      })
      // ContextLogger.debug({
      //   message: `UserInfoRepository.findByEmailAndPassword() 오류 발생`,
      //   meta: {
      //     error: error instanceof Error ? error.message : String(error),
      //   },
      // })
      // throw error
    }
  }

  /**
   * 이메일로 단일 사용자 조회
   */
  async findByEmail({ email }: { email: string }): Promise<UserInfoTable | null> {
    try {
      asyncContextStorage.addRepository({ name: this.repositoryName })
      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByEmail", state: "start" })

      const query = `SELECT * FROM ${this.tableName} WHERE email=?`
      const params = [email]
      const result = await this.executeQuerySingle<UserInfoTable>({ sql: query, params, request: `${this.repositoryName}.findByEmail` })

      asyncContextStorage.addOrder({ component: this.repositoryName, method: "findByEmail", state: "end" })
      return result
    } catch (error) {
      return this.handleRepositoryError({
        error,
        method: "findById",
        message: "[User Mail로 조회] - 오류가 발생했습니다",
      })
      // ContextLogger.debug({
      //   message: `UserInfoRepository.findByEmail() 오류 발생`,
      //   meta: {
      //     error: error instanceof Error ? error.message : String(error),
      //   },
      // })
      // throw error
    }
  }
}
