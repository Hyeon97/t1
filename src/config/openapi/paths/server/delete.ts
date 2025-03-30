/**
 * 서버 삭제 API 경로 정의
 */
export const serverDeletePath = {
  "/servers/{identifier}": {
    delete: {
      summary: "서버 삭제",
      description: "특정 서버를 삭제합니다. 서버 ID 또는 이름으로 식별할 수 있습니다.",
      tags: ["Server Management"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "identifier",
          in: "path",
          description: "서버 식별자 (ID 또는 이름)",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "서버 삭제 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/DeleteServerResponse",
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
        "403": {
          $ref: "#/components/responses/Forbidden",
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
