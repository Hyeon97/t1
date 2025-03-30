/**
 * 서버 목록 조회 API 경로 정의
 */
export const serverListPath = {
  "/servers": {
    get: {
      summary: "서버 목록 조회",
      description: "서버 목록을 조회합니다. 다양한 쿼리 파라미터를 통해 필터링 및 추가 정보 포함 여부를 설정할 수 있습니다.",
      tags: ["Server Management"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "mode",
          in: "query",
          description: "시스템 모드 필터 (source, target)",
          required: false,
          schema: {
            type: "string",
            enum: ["source", "target"],
          },
        },
        {
          name: "os",
          in: "query",
          description: "운영체제 타입 필터 (win, lin)",
          required: false,
          schema: {
            type: "string",
            enum: ["win", "lin"],
          },
        },
        {
          name: "connection",
          in: "query",
          description: "연결 상태 필터 (connect, disconnect)",
          required: false,
          schema: {
            type: "string",
            enum: ["connect", "disconnect"],
          },
        },
        {
          name: "license",
          in: "query",
          description: "라이센스 할당 상태 필터 (assign, unassign)",
          required: false,
          schema: {
            type: "string",
            enum: ["assign", "unassign"],
          },
        },
        {
          name: "network",
          in: "query",
          description: "네트워크 정보 포함 여부 (true, false)",
          required: false,
          schema: {
            type: "boolean",
          },
        },
        {
          name: "disk",
          in: "query",
          description: "디스크 정보 포함 여부 (true, false)",
          required: false,
          schema: {
            type: "boolean",
          },
        },
        {
          name: "partition",
          in: "query",
          description: "파티션 정보 포함 여부 (true, false)",
          required: false,
          schema: {
            type: "boolean",
          },
        },
        {
          name: "repository",
          in: "query",
          description: "리포지토리 정보 포함 여부 (true, false)",
          required: false,
          schema: {
            type: "boolean",
          },
        },
        {
          name: "detail",
          in: "query",
          description: "상세 정보 포함 여부 (true, false)",
          required: false,
          schema: {
            type: "boolean",
          },
        },
      ],
      responses: {
        "200": {
          description: "서버 목록 조회 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ServerListResponse",
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
        "500": {
          $ref: "#/components/responses/ServerError",
        },
      },
    },
  },
}
