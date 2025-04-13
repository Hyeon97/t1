import { middleware } from "express-openapi-validator"
import fs from "fs"
import path from "path"
import swaggerUi from "swagger-ui-express"
import { ContextLogger } from "../utils/logger/logger.custom"
import { logger } from "../utils/logger/logger.util"
import { configManager } from "./config-manager"
import { generateOpenApiSpec } from "./openapi"

export class OpenApiConfig {
  private readonly specPath: string
  private readonly jsonSpecPath: string

  constructor() {
    // ConfigManager를 사용하여 실행 디렉토리 및 패키징 상태 확인
    const isPackaged = configManager.isPackaged()
    const rootDir = configManager.getExecDir()

    this.specPath = path.join(rootDir, "/src/config/openapi/openapi.yaml")
    this.jsonSpecPath = path.join(rootDir, "/src/config/openapi/openapi.json")

    logger.debug(`OpenAPI 스펙 경로: ${this.specPath}`)
    logger.debug(`OpenAPI JSON 스펙 경로: ${this.jsonSpecPath}`)
  }

  /**
   * OpenAPI 설정 초기화
   * Express 앱에 Swagger UI와 OpenAPI Validator를 설정합니다.
   */
  async setupOpenApi({ app }: { app: any }): Promise<void> {
    try {
      logger.info("OpenAPI 설정 초기화 시작")

      // configManager가 초기화되었는지 확인
      if (!configManager.isInitialized()) {
        logger.warn("ConfigManager가 초기화되지 않았습니다. 초기화를 진행합니다.")
        configManager.initialize()
      }

      // 모듈화된 구조에서 OpenAPI 스펙 생성
      const swaggerDocument = generateOpenApiSpec()

      // OpenAPI 스펙 디렉토리 생성 확인
      const specDir = path.dirname(this.jsonSpecPath)
      if (!fs.existsSync(specDir)) {
        logger.debug(`OpenAPI 스펙 디렉토리 생성: ${specDir}`)
        fs.mkdirSync(specDir, { recursive: true })
      }

      // 필요한 경우에만 JSON 파일로 저장
      let shouldWriteFile = true

      if (fs.existsSync(this.jsonSpecPath)) {
        try {
          const existingContent = fs.readFileSync(this.jsonSpecPath, "utf8")
          const existingDoc = JSON.parse(existingContent)

          // 내용이 동일한지 비교 (더 효율적인 비교를 위해 간단한 checksum 비교를 고려할 수 있음)
          if (JSON.stringify(existingDoc) === JSON.stringify(swaggerDocument)) {
            shouldWriteFile = false
            logger.debug("OpenAPI 스펙이 변경되지 않았습니다. 파일을 업데이트하지 않습니다.")
          }
        } catch (err) {
          // 파일 읽기나 파싱 실패시 새로 쓰기
          shouldWriteFile = true
          logger.warn("기존 OpenAPI 스펙 파일 읽기 실패, 파일을 다시 생성합니다.", { error: err })
        }
      }

      if (shouldWriteFile) {
        fs.writeFileSync(this.jsonSpecPath, JSON.stringify(swaggerDocument, null, 2), "utf8")
        logger.info(`OpenAPI JSON 스펙이 ${this.jsonSpecPath}에 업데이트 되었습니다.`)
      }

      // API 경로 가져오기
      const apiPrefix = configManager.getApiPrefix()

      // Swagger UI 설정 (JSON 문서 직접 사용)
      app.use(
        `${apiPrefix}/docs`,
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, {
          explorer: true,
          customCss: ".swagger-ui .topbar { display: none }", // 상단바 제거 (선택 사항)
        })
      )

      // OpenAPI Validator 미들웨어 설정
      const validatorMiddleware = middleware({
        apiSpec: this.jsonSpecPath, // 파일 경로를 사용 (파일에 이미 저장했으므로)
        validateRequests: true,
        validateResponses: process.env.NODE_ENV !== "production", // 프로덕션에서는 응답 검증을 비활성화하여 성능 향상
        operationHandlers: false,
      })

      // 미들웨어 적용
      for (const mw of validatorMiddleware) {
        app.use(mw)
      }

      ContextLogger.info({
        message: `OpenAPI 문서가 ${apiPrefix}/docs 에서 제공됩니다`,
      })

      logger.info("OpenAPI 설정 초기화 완료")
    } catch (error) {
      ContextLogger.error({
        message: "[OpenAPI 설정 초기화] - 오류 발생",
        error: error instanceof Error ? error : undefined,
      })
      // Validator 오류는 서버 시작을 중단시키지 않도록 함
      logger.error("OpenAPI 설정 오류:", { error })
    }
  }
}
