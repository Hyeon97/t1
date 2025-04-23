/**
 * OpenAPI 명세를 생성합니다.
 * 모든 컴포넌트를 조합하여 완전한 OpenAPI 문서를 반환합니다.
 */

import { commonResponses } from "./components/responses/common"
import { authSchemas } from "./components/schemas/auth"
import { backupSchemas } from "./components/schemas/backup"
import { errorSchemas } from "./components/schemas/errors"
import { serverSchemas } from "./components/schemas/server"
import { security, securitySchemes } from "./components/security"
import { info, servers } from "./info"
import { authPaths } from "./paths/auth"
import { backupPaths } from "./paths/backup"
import { serverPaths } from "./paths/server"

export const generateOpenApiSpec = () => {
  return {
    openapi: "3.0.3",
    info,
    servers,
    components: {
      schemas: {
        ...errorSchemas,
        ...authSchemas,
        ...serverSchemas,
        ...backupSchemas
      },
      responses: {
        ...commonResponses,
      },
      securitySchemes,
    },
    security,
    paths: {
      ...authPaths,
      ...serverPaths,
      ...backupPaths
      // ...fallbackPaths,
    },
  }
}
