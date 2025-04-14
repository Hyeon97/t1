import dotenv from "dotenv"
import dotenvExpand from "dotenv-expand"
import fs from "fs"
import path from "path"

/**
 * 중앙화된 환경 설정 관리 클래스
 * 환경 변수 로드 및 설정 관리를 담당하는 클래스
 */
export class ConfigManager {
  private static instance: ConfigManager
  private readonly configs: Map<string, any> = new Map()
  private initialized = false

  // 환경 관련 속성
  private static readonly isPackaged = "pkg" in process
  private static readonly execDir = ConfigManager.isPackaged ? path.dirname(process.execPath) : process.cwd()

  private logMessage({
    message,
    level = "info",
    highlightParts = [],
  }: {
    message: string
    level?: "info" | "warn" | "error"
    highlightParts?: string[]
  }): void {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19)

    // level에 따른 색상 코드 선택
    let colorCode: string
    switch (level) {
      case "warn":
        colorCode = "\x1b[33m" // 노란색
        break
      case "error":
        colorCode = "\x1b[31m" // 빨간색
        break
      default:
        colorCode = "\x1b[32m" // 초록색 (info)
    }

    // 하이라이트할 부분이 있으면 각 부분을 level에 맞는 색상으로 변경
    let formattedMessage = message
    if (highlightParts.length > 0) {
      highlightParts.forEach((part) => {
        if (formattedMessage.includes(part)) {
          formattedMessage = formattedMessage.replace(part, `${colorCode}${part}\x1b[0m`)
        }
      })
    }

    // 로그 레벨에 따라 적절한 콘솔 메서드 사용
    switch (level) {
      case "warn":
        console.warn(`${timestamp} [WARN] ${formattedMessage}`)
        break
      case "error":
        console.error(`${timestamp} [ERROR] ${formattedMessage}`)
        break
      default:
        console.log(`${timestamp} [INFO] ${formattedMessage}`)
    }
  }

  /**
   * 생성자를 private으로 변경
   */
  private constructor() { }

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
  public isPackaged(): boolean {
    return ConfigManager.isPackaged
  }

  /**
   * 실행 디렉토리 반환
   */
  public getExecDir(): string {
    return ConfigManager.execDir
  }

  /**
   * 환경 변수를 로드하고 실행 정보를 설정합니다.
   */
  public initialize(): void {
    if (this.initialized) {
      return
    }

    this.logMessage({ message: `ConfigManager 초기화 시작...`, highlightParts: [`ConfigManager 초기화 시작...`] })

    // 패키징 환경에 따라 다른 환경 변수 파일 로드
    if (ConfigManager.isPackaged) {
      // 패키징된 환경: apiENV 파일 사용
      const envPath = path.join(ConfigManager.execDir, "apiENV")
      this.loadEnvFile({ envPath })
    } else {
      // 개발 환경: NODE_ENV에 따른 .env 파일 사용
      this.loadEnvFromNodeEnv()
    }

    // NODE_ENV가 설정되지 않은 경우 기본값 설정
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "development"
      this.logMessage({
        message: `NODE_ENV가 설정되지 않아 기본값 'development'로 설정합니다.`,
        level: "warn",
        highlightParts: [`NODE_ENV가 설정되지 않아 기본값 'development'로 설정합니다.`],
      })
    }

    // 실행 정보 로깅
    this.logEnvironmentInfo()

    // API 설정 초기화
    this.setupApiConfig()

    // JWT 설정 초기화
    this.setupJwtConfig()

    // 데이터베이스 설정 초기화
    this.setupDatabaseConfig()

    this.initialized = true
    this.logMessage({ message: `ConfigManager 초기화 완료`, highlightParts: [`ConfigManager 초기화 완료`] })
  }

  /**
   * 초기화 상태 확인
   */
  public isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 환경별 .env 파일 로드
   */
  private loadEnvFromNodeEnv(): void {
    const nodeEnv = process.env.NODE_ENV || "development"
    const envPath = path.resolve(process.cwd(), "env", `.env.${nodeEnv}`)
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

        this.logMessage({ message: `환경 변수 파일 로드: ${envPath}`, highlightParts: [`환경 변수 파일 로드: ${envPath}`] })
      } catch (error) {
        this.logMessage({
          message: `환경 변수 파일 로드 중 오류 발생: ${error}`,
          level: "error",
          highlightParts: [`환경 변수 파일 로드 중 오류 발생: ${error}`],
        })
        this.logMessage({
          message: "기본 환경 변수를 사용합니다.",
          level: "warn",
          highlightParts: ["기본 환경 변수를 사용합니다."],
        })
      }
    } else {
      this.logMessage({
        message: `환경 변수 파일을 찾을 수 없습니다: ${envPath}`,
        level: "warn",
        highlightParts: [`환경 변수 파일을 찾을 수 없습니다: ${envPath}`],
      })
      this.logMessage({
        message: `기본 환경 변수를 사용합니다.`,
        level: "warn",
        highlightParts: [`기본 환경 변수를 사용합니다.`],
      })
    }
  }

  /**
   * 현재 환경 정보 로깅
   */
  private logEnvironmentInfo(): void {
    this.logMessage({
      message: `실행 모드: ${ConfigManager.isPackaged ? "패키징됨" : "개발"}`,
      highlightParts: [`실행 모드: ${ConfigManager.isPackaged ? "패키징됨" : "개발"}`],
    })
    this.logMessage({ message: `실행 디렉토리: ${ConfigManager.execDir}`, highlightParts: [`실행 디렉토리: ${ConfigManager.execDir}`] })
    this.logMessage({ message: `환경: ${process.env.NODE_ENV}`, highlightParts: [`환경: ${process.env.NODE_ENV}`] })
  }

  /**
   * 초기화 상태 확인 및 필요시 초기화
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize()
    }
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
   * API config 값 세팅
   */
  private setupApiConfig(): void {
    this.logMessage({
      message: `API 설정 초기화 중...`,
      highlightParts: [`API 설정 초기화 중...`],
    })
    this.configs.set("api", {
      prefix: process.env.API_PREFIX || "/api",
      port: parseInt(process.env.PORT || "3000", 10),
      environment: process.env.NODE_ENV || "development",
      logLevel: process.env.LOG_LEVEL || "info",
      logDir: process.env.LOG_DIR || "logs",
      logFormat: process.env.LOG_FORMAT || "combined",
    })
    this.logMessage({
      message: `API 설정 초기화 완료`,
      highlightParts: [`API 설정 초기화 완료`],
    })
    console.dir(this.configs.get("api"))
  }

  public getApiConfig(): {
    prefix: string
    port: number
    environment: string
    logLevel: string
    logDir: string
    logFormat: string
  } {
    this.ensureInitialized()
    return this.getConfig<{
      prefix: string
      port: number
      environment: string
      logLevel: string
      logDir: string
      logFormat: string
    }>({ key: "api" })
  }

  /**
   * API 접두사 가져오기
   */
  public getApiPrefix(): string {
    this.ensureInitialized()
    return this.getApiConfig().prefix
  }

  /**
   * 서버 포트 가져오기
   */
  public getPort(): number {
    this.ensureInitialized()
    return this.getApiConfig().port
  }

  /**
   * 애플리케이션 환경 가져오기
   */
  public getEnv(): string {
    this.ensureInitialized()
    try {
      const apiConfig = this.getConfig<any>({ key: "api" })
      if (apiConfig && apiConfig.environment) {
        return apiConfig.environment
      }
      return process.env.NODE_ENV || "development"
    } catch (error) {
      this.logMessage({
        message: `환경 정보를 가져오는 중 오류 발생: ${error}`,
        level: "warn",
        highlightParts: [`환경 정보를 가져오는 중 오류 발생: ${error}`],
      })
      return "development"
    }
  }

  /**
   * 로그 레벨 가져오기
   */
  public getLogLevel(): string {
    this.ensureInitialized()
    try {
      const apiConfig = this.getConfig<any>({ key: "api" })
      if (apiConfig && apiConfig.logLevel) {
        return apiConfig.logLevel
      }
      return process.env.LOG_LEVEL || "info"
    } catch (error) {
      this.logMessage({
        message: `로그 레벨을 가져오는 중 오류 발생: ${error}`,
        level: "warn",
        highlightParts: [`로그 레벨을 가져오는 중 오류 발생: ${error}`],
      })
      return "info"
    }
  }

  /**
   * 로그 디렉토리 가져오기
   */
  public getLogDir(): string {
    this.ensureInitialized()
    try {
      const apiConfig = this.getConfig<any>({ key: "api" })
      if (apiConfig && apiConfig.logDir) {
        return apiConfig.logDir
      }
      return process.env.LOG_DIR || "logs"
    } catch (error) {
      this.logMessage({
        message: `로그 디렉토리를 가져오는 중 오류 발생: ${error}`,
        level: "warn",
        highlightParts: [`로그 디렉토리를 가져오는 중 오류 발생: ${error}`],
      })
      return "logs"
    }
  }

  /**
   * 로그 포맷 가져오기
   */
  public getLogFormat(): string {
    this.ensureInitialized()
    try {
      const apiConfig = this.getConfig<any>({ key: "api" })
      if (apiConfig && apiConfig.logFormat) {
        return apiConfig.logFormat
      }
      return process.env.LOG_FORMAT || "combined"
    } catch (error) {
      this.logMessage({
        message: `로그 포맷을 가져오는 중 오류 발생: ${error}`,
        level: "warn",
        highlightParts: [`로그 포맷을 가져오는 중 오류 발생: ${error}`],
      })
      return "combined"
    }
  }

  /**
   * 설정 가져오기
   */
  public getConfig<T>({ key }: { key: string }): T {
    this.ensureInitialized()
    return this.configs.get(key)
  }

  /**
   * 데이터베이스 설정 가져오기
   */
  public getDatabaseConfig(): any {
    this.ensureInitialized()
    return this.getConfig<any>({ key: "database" })
  }

  /**
   * JWT 설정 가져오기
   */
  public getJwtConfig(): { secret: string; expiresIn: string } {
    this.ensureInitialized()
    return this.getConfig<{ secret: string; expiresIn: string }>({ key: "jwt" })
  }
}

// 싱글톤 인스턴스 내보내기
export const configManager = ConfigManager.getInstance()
