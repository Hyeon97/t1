/**
 * API 보안 스키마 정의
 */
export const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
}

/**
 * 전역 보안 요구사항
 */
export const security = [
  {
    bearerAuth: [],
  },
]
