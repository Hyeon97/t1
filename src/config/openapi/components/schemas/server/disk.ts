/**
 * 서버 디스크 정보 스키마
 */
export const serverDiskSchemas = {
  DiskInfo: {
    type: "object",
    properties: {
      device: {
        type: "string",
        example: "/dev/vda",
      },
      diskType: {
        type: "string",
        example: "Bios",
      },
      diskSize: {
        type: "string",
        example: "53687091200 (50.00 GB)",
      },
      lastUpdated: {
        type: "string",
        format: "date-time",
        example: "2025-02-19T02:56:01.000Z",
      },
    },
  },
}
