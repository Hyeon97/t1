/**
 * 인증 관련 스키마 정의
 */
export const authSchemas = {
  TokenIssueRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
      },
      password: {
        type: "string",
        format: "password",
        example: "password123",
      },
    },
  },
  TokenResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "토큰이 성공적으로 발급되었습니다",
      },
      data: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example: "created tokens...",
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
