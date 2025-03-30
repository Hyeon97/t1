/**
 * 서버 네트워크 정보 스키마
 */
export const serverNetworkSchemas = {
  NetworkInfo: {
    type: "object",
    properties: {
      name: {
        type: "string",
        example: "ens3",
      },
      ipAddress: {
        type: "string",
        example: "127.0.0.1",
      },
      subNet: {
        type: "string",
        example: "255.255.255.0",
      },
      gateWay: {
        type: "string",
        example: "127.0.0.1",
      },
      macAddress: {
        type: "string",
        example: "aa:aa:aa:aa:aa:1",
      },
      lastUpdated: {
        type: "string",
        format: "date-time",
        example: "2025-02-19T02:56:01.000Z",
      },
    },
  },
}
