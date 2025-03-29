import { middleware } from "express-openapi-validator"
import fs from "fs"
import path from "path"
import swaggerUi from "swagger-ui-express"
import { ContextLogger } from "../utils/logger/logger.custom"
import { config } from "./config"

export class OpenApiConfig {
  private readonly specPath: string
  private readonly jsonSpecPath: string

  constructor() {
    // 개발 환경에서는 소스 디렉토리에서, 패키징된 환경에서는 실행 디렉토리에서 찾음
    const isPackaged = "pkg" in process
    const rootDir = isPackaged ? path.dirname(process.execPath) : process.cwd()

    this.specPath = path.join(rootDir, "/src/config/openapi/openapi.yaml")
    this.jsonSpecPath = path.join(rootDir, "/src/config/openapi/openapi.json")

    // 스펙 파일 존재 여부 확인
    if (!fs.existsSync(this.jsonSpecPath)) {
      console.warn(`OpenAPI JSON 스펙 파일을 찾을 수 없습니다: ${this.jsonSpecPath}`)
    }
  }

  /**
   * OpenAPI 설정 초기화
   */
  async setupOpenApi({ app }: { app: any }): Promise<void> {
    try {
      // JSON 스펙 파일을 직접 로드
      let swaggerDocument = null

      if (fs.existsSync(this.jsonSpecPath)) {
        const fileContent = fs.readFileSync(this.jsonSpecPath, "utf8")
        swaggerDocument = JSON.parse(fileContent)
      } else {
        console.warn("OpenAPI JSON 스펙 파일을 찾을 수 없어 기본 문서를 사용합니다.")
        swaggerDocument = {
          openapi: "3.0.3",
          info: {
            title: "API Server",
            version: "1.0.0",
            description: "API Documentation (Spec file not found)",
          },
          paths: {},
        }
      }

      // Swagger UI 설정 (JSON 문서 직접 사용)
      app.use(`${config.apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument))

      // 스펙 파일이 존재하는 경우에만 Validator 설정
      if (fs.existsSync(this.jsonSpecPath)) {
        // OpenAPI Validator 미들웨어 설정
        const validatorMiddleware = middleware({
          apiSpec: this.jsonSpecPath,
          validateRequests: true,
          validateResponses: true,
          operationHandlers: false,
        })

        // 미들웨어 적용
        for (const mw of validatorMiddleware) {
          app.use(mw)
        }
      }

      ContextLogger.info({
        message: `OpenAPI 문서가 ${config.apiPrefix}/docs 에서 제공됩니다`,
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
