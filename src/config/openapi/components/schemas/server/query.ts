/**
 * 서버 조회 쿼리 파라미터 스키마
 */
export const serverQuerySchemas = {
  ServerListQuery: {
    type: "object",
    properties: {
      mode: {
        type: "string",
        enum: ["source", "target"],
        description: "시스템 모드 필터",
      },
      os: {
        type: "string",
        enum: ["win", "lin"],
        description: "운영체제 타입 필터",
      },
      connection: {
        type: "string",
        enum: ["connect", "disconnect"],
        description: "연결 상태 필터",
      },
      license: {
        type: "string",
        enum: ["assign", "unassign"],
        description: "라이센스 할당 상태 필터",
      },
      network: {
        type: "boolean",
        description: "네트워크 정보 포함 여부",
      },
      disk: {
        type: "boolean",
        description: "디스크 정보 포함 여부",
      },
      partition: {
        type: "boolean",
        description: "파티션 정보 포함 여부",
      },
      repository: {
        type: "boolean",
        description: "리포지토리 정보 포함 여부",
      },
      detail: {
        type: "boolean",
        description: "상세 정보 포함 여부",
      },
    },
  },
}
