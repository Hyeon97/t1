/**
 * Backup API 응답 스키마
 */
export const backupResponseSchema = {
  // Backup 목록 조회 응답 스키마
  BackupListResponse: {
    type: "object",
    properties: {
      requestID: {
        type: "string",
        example: "9e562891-3c21-40ed-a145-c99910cf6197"
      },
      message: {
        type: "string",
        example: "Backup list"
      },
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/BackupItem"
        },
        description: "기본 백업 항목 목록. detail=true 쿼리 파라미터가 사용되면 DetailedBackupItem 스키마가 대신 사용됩니다."
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:02:17.569Z"
      }
    },
    required: ["requestID", "message", "success", "data", "timestamp"]
  },

  // 기본 BackupItem 스키마
  BackupItem: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "14"
      },
      jobName: {
        type: "string",
        example: "prd-search01-new_ROOT"
      },
      systemName: {
        type: "string",
        example: "prd-search01-new (172.25.1.63)"
      },
      partition: {
        type: "string",
        example: "/"
      },
      mode: {
        type: "string",
        enum: ["Full Backup", "Inc Backup", "Smart Backup"],
        example: "Full Backup"
      },
      result: {
        type: "string",
        enum: ["RUN", "COMPLETE", "START", "WAITING", "CANCEL", "SCHEDULED"],
        example: "COMPLETE"
      },
      schedule: {
        type: "object",
        properties: {
          basic: {
            type: "string",
            example: "-"
          },
          advanced: {
            type: "string",
            example: "-"
          }
        },
        required: ["basic", "advanced"]
      },
      repository: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "14"
          },
          type: {
            type: "string",
            enum: ["SMB", "NFS", "SSH"],
            example: "NFS"
          },
          path: {
            type: "string",
            example: "172.25.0.83:/ZConverter"
          }
        },
        required: ["id", "type", "path"]
      },
      timestamp: {
        type: "object",
        properties: {
          start: {
            type: "string",
            format: "date-time",
            example: "2025-02-19T10:59:10.000Z"
          },
          end: {
            type: "string",
            format: "date-time",
            example: "2025-02-19 20:02:12"
          },
          elapsed: {
            type: "string",
            example: "0 day, 00:03:02"
          }
        },
        required: ["start", "end", "elapsed"]
      },
      lastUpdate: {
        type: "string",
        format: "date-time",
        example: "2025-02-19T11:02:12.000Z"
      }
    },
    required: ["id", "jobName", "systemName", "partition", "mode", "result", "schedule", "repository", "timestamp", "lastUpdate"]
  },

  // 상세 정보가 포함된 BackupItem 스키마 (detail=true 쿼리 파라미터 사용 시)
  DetailedBackupItem: {
    allOf: [
      { $ref: "#/components/schemas/BackupItem" },
      {
        type: "object",
        properties: {
          option: {
            type: "object",
            properties: {
              rotation: {
                type: "string",
                description: "백업 로테이션 설정",
                example: "1"
              },
              excludeDir: {
                type: "string",
                description: "제외할 디렉토리 목록",
                example: "-"
              },
              compression: {
                type: "string",
                enum: ["Use", "Not Use"],
                description: "압축 사용 여부",
                example: "Use"
              },
              encryption: {
                type: "string",
                enum: ["Use", "Not Use"],
                description: "암호화 사용 여부",
                example: "Not Use"
              }
            },
            required: ["rotation", "excludeDir", "compression", "encryption"]
          }
        },
        required: ["option"]
      }
    ]
  }
}