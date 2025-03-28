import cors from "cors"
import express, { Application } from "express"
import helmet from "helmet"
import "reflect-metadata"
import { config } from "./src/config/config"
import { AuthRoutes } from "./src/domain/auth/routes/auth.routes"
import { errorHandler, notFoundHandler } from "./src/errors/error-handler"
import { logger, morganMiddleware } from "./src/utils/logger/logger.util"

class App {
  public app: Application

  constructor() {
    this.app = express()
    this.configureMiddleware()
    this.setupRoutes()
    this.setupErrorHandling()

    // 서버 시작 로깅
    logger.info(`애플리케이션이 ${config.environment} 모드로 초기화되었습니다.`)
  }

  private configureMiddleware(): void {
    // 로깅 미들웨어 등록 (가장 먼저 등록하여 모든 요청 로깅)
    this.app.use(morganMiddleware)
    // JSON 파싱
    this.app.use(express.json())
    // URL 인코딩된 본문 파싱
    this.app.use(express.urlencoded({ extended: true }))
    // CORS 설정
    this.app.use(cors())
    // 보안 헤더 설정
    this.app.use(helmet())
  }

  private setupRoutes(): void {
    // 기본 라우트
    this.app.get("/", (req, res) => {
      logger.debug("루트 경로 요청 처리")
      res.json({
        message: "API 서버가 실행 중입니다",
        environment: config.environment,
        timestamp: new Date().toISOString(),
      })
    })

    // API 라우트
    this.app.use(`${config.apiPrefix}/token`, new AuthRoutes().router)
    // this.app.use(`${config.apiPrefix}/users`, validateToken, new UserRoutes().router)
    // this.app.use(`${config.apiPrefix}/servers`, validateToken, new ServerRoutes().router)
    // this.app.use(`${config.apiPrefix}/zdms`, validateToken, new ZDMRoutes().router)
    // this.app.use(`${config.apiPrefix}/backups`, validateToken, new BackupRoutes().router)
  }

  private setupErrorHandling(): void {
    // 404 에러 처리
    this.app.use(notFoundHandler)

    // 전역 에러 핸들러
    this.app.use(errorHandler)

    logger.info("에러 핸들러가 설정되었습니다.")
  }
}

export const app = new App().app
