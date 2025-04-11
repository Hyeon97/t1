import cors from "cors"
import express, { Application } from "express"
import helmet from "helmet"
import "reflect-metadata"
import { config } from "./src/config/config"
import { ConfigManager } from "./src/config/config-manager"
import { OpenApiConfig } from "./src/config/openapi-manager"
import { AuthRoutes } from "./src/domain/auth/routes/auth.routes"
import { validateToken } from "./src/domain/auth/validators/token.validators"
import { BackupRoutes } from "./src/domain/backup/routes/backup.routes"
import { ServerRoutes } from "./src/domain/server/routes/server.routes"
import { ZdmRoutes } from "./src/domain/zdm/routes/zdm.routes"
import { errorHandler, notFoundHandler } from "./src/errors"
import { asyncContextMiddleware } from "./src/middlewares/logging/asyncContextMiddleware"
import { logger, morganMiddleware } from "./src/utils/logger/logger.util"

class App {
  public app: Application

  constructor() {
    // 환경 설정 초기화
    ConfigManager.getInstance().initialize()
    //  기본 설정 초기화
    this.app = express()
    this.configureMiddleware()
    this.setupHealthCheck()
    this.setupRoutes()
    this.setOpenApi()
    this.setupErrorHandling()

    // 서버 시작 로깅
    logger.info(`애플리케이션이 ${config.environment} 모드로 초기화되었습니다.`)
  }

  private configureMiddleware(): void {
    // 요청 ID 생성 및 로깅 미들웨어 (가장 먼저 등록)
    this.app.use(asyncContextMiddleware)
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

  private setupHealthCheck(): void {
    // 기본 라우트
    this.app.get("/", (req, res) => {
      logger.debug("루트 경로 요청 처리")
      res.json({
        message: "API 서버가 실행 중입니다",
        environment: config.environment,
        timestamp: new Date().toISOString(),
      })
    })

    // 상태 확인 엔드포인트
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    })
  }

  private async setupRoutes(): Promise<void> {
    this.app.use(`${config.apiPrefix}/token`, new AuthRoutes().router)
    this.app.use(`${config.apiPrefix}/servers`, validateToken, new ServerRoutes().router)
    this.app.use(`${config.apiPrefix}/servers`, validateToken, new ServerRoutes().router)
    this.app.use(`${config.apiPrefix}/zdms`, validateToken, new ZdmRoutes().router)
    this.app.use(`${config.apiPrefix}/backups`, new BackupRoutes().router)
  }

  private setupErrorHandling(): void {
    // 404 에러 처리
    this.app.use(notFoundHandler)

    // 전역 에러 핸들러
    this.app.use(errorHandler)

    logger.info("에러 핸들러가 설정되었습니다.")
  }

  private async setOpenApi(): Promise<void> {
    try {
      // OpenAPI 설정
      const openApiConfig = new OpenApiConfig()
      await openApiConfig.setupOpenApi({ app: this.app as any })
    } catch (error) {
      logger.error("API 설정 실패", error)
    }
  }
}

export const app = new App().app
