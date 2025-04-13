// ==========================================
// 환경 변수, 설정 초기화
// ==========================================
import { configManager } from "./src/config/config-manager"

// 설정 관리자 초기화 (환경 변수 로드 포함)
console.log("=== [ 환경 변수 및 설정 로드 ] ===")
configManager.initialize()
console.log("=== [ 환경 변수 및 설정 로드 완료 ] ===")

// ==========================================
// 로거 초기화 (환경 변수와 설정 의존)
// ==========================================
import { logger } from "./src/utils/logger/logger.util"
import { ContextLogger } from "./src/utils/logger/logger.custom"

// ==========================================
// 나머지 모듈 및 의존성 임포트
// ==========================================
import columnify from "columnify"
import listEndpoints from "express-list-endpoints"
import { app } from "./app"
import { DatabasePool } from "./src/database/connection"

//  엔드포인트 로깅
const endPointLogging = () => {
  const endpoints = listEndpoints(app)
  const rows = endpoints.map((endpoint) => ({
    methods: `[ ${endpoint.methods.join(", ")} ]`,
    path: endpoint.path,
  }))
  console.log(`Currently available APIs endpoint list.\n${columnify(rows, { columnSplitter: "  " })}`)
}

//  데이터베이스 연결 테스트
const checkDatabaseConnection = async () => {
  logger.info("데이터베이스 연결 시도 중...")
  const dbConnected = await DatabasePool.getInstance().testConnection()

  if (!dbConnected) {
    logger.error("데이터베이스 연결 실패로 서버 시작이 중단되었습니다")
    logger.info("환경 변수를 확인하세요:")
    logger.info(`- DB_HOST: ${process.env.DB_HOST || "설정되지 않음"}`)
    logger.info(`- DB_PORT: ${process.env.DB_PORT || "설정되지 않음"}`)
    logger.info(`- DB_USER: ${process.env.DB_USER || "설정되지 않음"}`)
    logger.info(`- DB_NAME: ${process.env.DB_NAME || "설정되지 않음"}`)

    // 개발 환경에서는 DB 연결 실패해도 서버 시작 (선택적)
    if (process.env.NODE_ENV === "development" && process.env.SKIP_DB_CHECK === "true") {
      logger.warn("개발 환경에서 DB 연결 없이 서버를 시작합니다.")
    } else {
      process.exit(1)
    }
  }
}

const startServer = async (): Promise<void> => {
  try {
    // 데이터베이스 연결 테스트
    await checkDatabaseConnection()

    //  엔드포인트 로깅
    if (process.env.NODE_ENV === "development") {
      endPointLogging()
    }

    // 서버 시작
    const port = configManager.getPort()
    const environment = configManager.getEnv()

    app.listen(port, () => {
      logger.info(`서버가 http://localhost:${port} 에서 실행 중입니다`)
      logger.info(`환경: ${environment}`)
    })
  } catch (error) {
    ContextLogger.error({
      message: `서버 시작 중 오류 발생`,
      meta: {
        error,
      },
    })
    process.exit(1)
  }
}

// 프로세스 종료 처리
process.on("unhandledRejection", (reason, promise) => {
  logger.error("처리되지 않은 Promise 거부:", reason)
  process.exit(1)
})

process.on("uncaughtException", (error) => {
  logger.error("처리되지 않은 예외:", error)
  process.exit(1)
})

// 서버 시작
startServer()
