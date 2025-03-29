import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import fs from "fs"
import path from "path"
import { Environment } from "./interface"

/**
 * 중앙화된 환경 설정 관리 클래스
 */
export class ConfigManager {
  private static instance: ConfigManager
  private readonly configs: Map<string, any> = new Map()
  private initialized = false

  /**
   * 싱글톤 인스턴스 반환
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }

  /**
   * 패키징 여부 확인
   */
  private get isPackaged(): boolean {
    return "pkg" in process
  }

  /**
   * 실행 디렉토리 반환
   */
  private get execDir(): string {
    return this.isPackaged ? path.dirname(process.execPath) : process.cwd()
  }

  /**
   * 환경 변수를 로드하고 실행 정보를 설정합니다.
   */
  public initialize(): void {
    if (this.initialized) {
      return
    }

    // 패키징 환경에 따라 다른 환경 변수 파일 로드
    if (this.isPackaged) {
      // 패키징된 환경: apiENV 파일 사용
      const envPath = path.join(this.execDir, "apiENV")
      this.loadEnvFile({ envPath })
    } else {
      // 개발 환경: NODE_ENV에 따른 .env 파일 사용
      this.loadEnvFromNodeEnv()
    }

    // NODE_ENV가 설정되지 않은 경우 기본값 설정
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "development"
      console.log("NODE_ENV가 설정되지 않아 기본값 'development'로 설정합니다.")
    }

    // 실행 정보 로깅
    this.logEnvironmentInfo()

    // JWT 설정 초기화
    this.setupJwtConfig()

    // 데이터베이스 설정 초기화
    this.setupDatabaseConfig()

    this.initialized = true
  }

  /**
   * 환경별 .env 파일 로드
   */
  private loadEnvFromNodeEnv(): void {
    const nodeEnv = process.env.NODE_ENV || "development"
    const envPath = path.resolve(process.cwd(), "env", `.env.${nodeEnv}`)
    console.log(`envPath: ${envPath}`)
    this.loadEnvFile({ envPath })
  }

  /**
   * 지정된 경로의 환경 변수 파일 로드
   */
  private loadEnvFile({ envPath }: { envPath: string }): void {
    if (fs.existsSync(envPath)) {
      try {
        const envConfig = dotenv.config({ path: envPath })
        dotenvExpand.expand(envConfig)

        console.log(`환경 변수 파일 로드: ${envPath}`)
      } catch (error) {
        console.error(`환경 변수 파일 로드 중 오류 발생: ${error}`)
        console.warn("기본 환경 변수를 사용합니다.")
      }
    } else {
      console.warn(`환경 변수 파일을 찾을 수 없습니다: ${envPath}`)
      console.warn("기본 환경 변수를 사용합니다.")
    }
  }

  /**
   * 현재 환경 정보 로깅
   */
  private logEnvironmentInfo(): void {
    console.log(`실행 모드: ${this.isPackaged ? "패키징됨" : "개발"}`)
    console.log(`실행 디렉토리: ${this.execDir}`)
    console.log(`환경: ${process.env.NODE_ENV}`)
  }

  /**
   * JWT 설정 초기화
   */
  private setupJwtConfig(): void {
    this.configs.set("jwt", {
      secret: process.env.JWT_SECRET || "z1c@o3n$v5e^r7t*e9r)A9P*I7S^e5r$v3e@r1",
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    })
  }

  /**
   * 데이터베이스 설정 초기화
   */
  private setupDatabaseConfig(): void {
    this.configs.set("database", {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "test_database",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),
      waitForConnections: true,
      queueLimit: 0,
    })
  }

  /**
   * 문자열 환경 변수 가져오기
   */
  public getEnvValue<T>({ key, defaultValue }: { key: string; defaultValue: T }): T {
    return (process.env[key] as unknown as T) || defaultValue
  }

  /**
   * 숫자 환경 변수 가져오기
   */
  public getNumberEnv({ key, defaultValue }: { key: string; defaultValue: number }): number {
    const value = process.env[key]

    if (value === undefined) {
      return defaultValue
    }

    const parsed = parseInt(value, 10)
    return isNaN(parsed) ? defaultValue : parsed
  }

  /**
   * 불리언 환경 변수 가져오기
   */
  public getBooleanEnv({ key, defaultValue }: { key: string; defaultValue: boolean }): boolean {
    const value = process.env[key]

    if (value === undefined) {
      return defaultValue
    }

    return value.toLowerCase() === "true"
  }

  /**
   * 설정 가져오기
   */
  public getConfig<T>({ key }: { key: string }): T {
    return this.configs.get(key)
  }

  /**
   * 현재 환경 반환
   */
  public getEnvironment(): Environment {
    return this.getEnvValue<Environment>({
      key: "NODE_ENV",
      defaultValue: "development",
    })
  }
}
