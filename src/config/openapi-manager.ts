import { middleware } from "express-openapi-validator"
import fs from "fs"
import path from "path"
import swaggerUi from "swagger-ui-express"
import { ContextLogger } from "../utils/logger/logger.custom"
// import { config } from "./config"
import { configManager } from "./config-manager"
import { generateOpenApiSpec } from "./openapi"

export class OpenApiConfig {
  private readonly specPath: string
  private readonly jsonSpecPath: string

  constructor() {
    // 개발 환경에서는 소스 디렉토리에서, 패키징된 환경에서는 실행 디렉토리에서 찾음
    const isPackaged = "pkg" in process
    const rootDir = isPackaged ? path.dirname(process.execPath) : process.cwd()

    this.specPath = path.join(rootDir, "/src/config/openapi/openapi.yaml")
    this.jsonSpecPath = path.join(rootDir, "/src/config/openapi/openapi.json")
  }

  /**
   * OpenAPI 설정 초기화
   */
  async setupOpenApi({ app }: { app: any }): Promise<void> {
    try {
      // 모듈화된 구조에서 OpenAPI 스펙 생성
      const swaggerDocument = generateOpenApiSpec()

      // 필요한 경우에만 JSON 파일로 저장
      let shouldWriteFile = true

      if (fs.existsSync(this.jsonSpecPath)) {
        try {
          const existingContent = fs.readFileSync(this.jsonSpecPath, "utf8")
          const existingDoc = JSON.parse(existingContent)

          // 내용이 동일한지 비교 (버전만 비교하거나 더 정확한 비교가 필요할 수 있음)
          if (JSON.stringify(existingDoc) === JSON.stringify(swaggerDocument)) {
            shouldWriteFile = false
          }
        } catch (err) {
          // 파일 읽기나 파싱 실패시 새로 쓰기
          shouldWriteFile = true
        }
      }

      if (shouldWriteFile) {
        if (!fs.existsSync(path.dirname(this.jsonSpecPath))) {
          fs.mkdirSync(path.dirname(this.jsonSpecPath), { recursive: true })
        }
        fs.writeFileSync(this.jsonSpecPath, JSON.stringify(swaggerDocument, null, 2), "utf8")
        ContextLogger.debug({
          message: `OpenAPI JSON 스펙이 ${this.jsonSpecPath}에 업데이트 되었습니다.`,
        })
      }

      // Swagger UI 설정 (JSON 문서 직접 사용)
      app.use(`${configManager.getApiPrefix()}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument))

      // OpenAPI Validator 미들웨어 설정
      const validatorMiddleware = middleware({
        apiSpec: this.jsonSpecPath, // 파일 경로를 사용 (파일에 이미 저장했으므로)
        validateRequests: true,
        validateResponses: true,
        operationHandlers: false,
      })

      // 미들웨어 적용
      for (const mw of validatorMiddleware) {
        app.use(mw)
      }

      ContextLogger.info({
        message: `OpenAPI 문서가 ${configManager.getApiPrefix()}/docs 에서 제공됩니다`,
      })
    } catch (error) {
      ContextLogger.error({
        message: "OpenAPI 설정 초기화 중 오류 발생",
        error: error instanceof Error ? error : undefined,
      })
      // Validator 오류는 서버 시작을 중단시키지 않도록 함
      console.error("OpenAPI 설정 오류:", error)
    }
  }
}
