/**
 * 기본 및 공통 경로 정의
 * 특히 404 오류에 대한 문서화를 위한 경로 포함
 */
export const fallbackPaths = {
  "/{route}": {
    parameters: [
      {
        name: "route",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
        description: "API 경로",
      },
    ],
    get: {
      summary: "기본 응답",
      description: "모든 기본 요청에 대한 공통 응답",
      responses: {
        "404": {
          $ref: "#/components/responses/NotFound",
        },
      },
    },
  },
}
