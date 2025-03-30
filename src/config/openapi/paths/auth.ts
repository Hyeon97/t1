/**
 * 인증 관련 API 경로 정의
 */
export const authPaths = {
  "/token/issue": {
    post: {
      summary: "토큰 발급",
      description: "이메일과 비밀번호를 사용하여 인증 토큰을 발급합니다",
      tags: ["Authentication"],
      security: [], // 인증 토큰 발급은 인증 필요 없음
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TokenIssueRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "토큰 발급 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TokenResponse",
              },
            },
          },
        },
        "400": {
          $ref: "#/components/responses/BadRequest",
        },
        "401": {
          $ref: "#/components/responses/Unauthorized",
        },
        "404": {
          $ref: "#/components/responses/NotFound",
        },
        "500": {
          $ref: "#/components/responses/ServerError",
        },
      },
    },
  },
}
