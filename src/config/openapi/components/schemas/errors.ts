/**
 * 에러 응답에 대한 스키마 정의
 */
export const errorSchemas = {
  Error: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      error: {
        type: "object",
        properties: {
          code: {
            type: "string",
            example: "NOT_FOUND",
          },
          message: {
            type: "string",
            example: "리소스를 찾을 수 없습니다",
          },
          details: {
            type: "object",
            example: {},
          },
        },
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-28T12:34:56.789Z",
      },
    },
  },
}
