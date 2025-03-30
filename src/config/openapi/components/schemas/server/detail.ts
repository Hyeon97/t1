/**
 * 서버 상세 정보 스키마
 */
export const serverDetailSchemas = {
  ServerDetailInfo: {
    type: "object",
    properties: {
      agent: {
        type: "string",
        example: "v7 build 7046",
      },
      model: {
        type: "string",
        example: "OpenStack Compute",
      },
      manufacturer: {
        type: "string",
        example: "Red Hat",
      },
      cpu: {
        type: "string",
        example: "Intel Xeon Processor (Cascadelake)",
      },
      cpuCount: {
        type: "string",
        example: "4",
      },
      memory: {
        type: "string",
        example: "8058433536 (7.51 GB)",
      },
    },
  },
}
