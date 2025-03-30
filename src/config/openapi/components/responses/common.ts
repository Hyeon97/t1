/**
 * 공통 응답 정의
 * 모든 API 엔드포인트에서 재사용할 수 있는 표준 응답
 */
export const commonResponses = {
  BadRequest: {
    description: "잘못된 요청",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Error",
        },
      },
    },
  },
  Unauthorized: {
    description: "인증 실패",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Error",
        },
      },
    },
  },
  Forbidden: {
    description: "접근 권한 없음",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Error",
        },
      },
    },
  },
  NotFound: {
    description: "리소스를 찾을 수 없음",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Error",
        },
      },
    },
  },
  ServerError: {
    description: "서버 오류",
    content: {
      "application/json": {
        schema: {
          $ref: "#/components/schemas/Error",
        },
      },
    },
  },
}
