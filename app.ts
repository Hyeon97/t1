import cors from "cors"
import express, { Application } from "express"
import helmet from "helmet"
import "reflect-metadata"
import { config } from "./src/config/config"
import { AuthRoutes } from "./src/domain/auth/routes/auth.routes"
import { errorHandler, notFoundHandler } from "./src/errors/error-handler"
import { logger, morganMiddleware } from "./src/utils/logger/logger.util"
import { ConfigManager } from "./src/config/config-manager"
import { requestLogger } from "./src/middlewares/logging/requestLogger"
import { OpenApiConfig } from "./src/config/openapi-manager"

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
    this.setupErrorHandling()

    // 서버 시작 로깅
    logger.info(`애플리케이션이 ${config.environment} 모드로 초기화되었습니다.`)
  }

  private configureMiddleware(): void {
    // 요청 ID 생성 및 로깅 미들웨어 (가장 먼저 등록)
    this.app.use(requestLogger)
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
    try {
      // OpenAPI 설정
      const openApiConfig = new OpenApiConfig()
      await openApiConfig.setupOpenApi({ app: this.app as any })

      // 인증 라우트
      this.app.use(`${config.apiPrefix}/token`, new AuthRoutes().router)

      // 다른 라우트들
      // this.app.use(`${config.apiPrefix}/users`, validateToken, new UserRoutes().router)
      // this.app.use(`${config.apiPrefix}/servers`, validateToken, new ServerRoutes().router)
    } catch (error) {
      logger.error("API 설정 실패", error)
    }
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
