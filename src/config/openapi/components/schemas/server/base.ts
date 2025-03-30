/**
 * 서버 기본 정보 스키마
 */
export const serverBaseSchemas = {
  ServerInfo: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "1",
      },
      systemName: {
        type: "string",
        example: "prd-web01 (127.0.0.1)",
      },
      systemMode: {
        type: "string",
        enum: ["source", "target"],
        example: "source",
      },
      os: {
        type: "string",
        enum: ["win", "lin"],
        example: "lin",
      },
      version: {
        type: "string",
        example: "Rocky Linux release 9.4 (Blue Onyx), 5.14.0-427.18.1.el9_4.x86_64",
      },
      ip: {
        type: "string",
        example: "222.122.111.200",
      },
      status: {
        type: "string",
        enum: ["connect", "disconnect"],
        example: "connect",
      },
      licenseID: {
        type: "string",
        example: "Unassigned",
      },
      lastUpdated: {
        type: "string",
        example: "2025-02-27 13:46:52",
      },
    },
  },
}
