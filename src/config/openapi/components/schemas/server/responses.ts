/**
 * 서버 API 응답 스키마
 */
export const serverResponseSchemas = {
  // 서버 목록 응답 스키마
  ServerListResponse: {
    type: "object",
    properties: {
      requestID: {
        type: "string",
        example: "9e562891-3c21-40ed-a145-c99910cf6197",
      },
      message: {
        type: "string",
        example: "server infomation list",
      },
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "array",
        items: {
          type: "object",
          allOf: [
            { $ref: "#/components/schemas/ServerInfo" },
            {
              type: "object",
              properties: {
                disk: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/DiskInfo",
                  },
                },
                network: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/NetworkInfo",
                  },
                },
              },
            },
            { $ref: "#/components/schemas/ServerDetailInfo" },
          ],
        },
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:02:17.569Z",
      },
    },
  },

  // 서버 삭제 응답 스키마
  DeleteServerResponse: {
    type: "object",
    properties: {
      requestID: {
        type: "string",
        example: "9e562891-3c21-40ed-a145-c99910cf6197",
      },
      message: {
        type: "string",
        example: "서버가 성공적으로 삭제되었습니다",
      },
      success: {
        type: "boolean",
        example: true,
      },
      data: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "28",
          },
        },
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:04:25.062Z",
      },
    },
  },
}
