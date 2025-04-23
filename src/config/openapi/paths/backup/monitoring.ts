/**
 * Backup 모니터링 API 경로 정의
 */
export const backupMonitoringPath = {
  "/backups/job-name/{jobName}/monitoring": {
    get: {
      summary: "작업 이름으로 Backup 모니터링",
      description: "특정 이름의 백업 작업 진행 상황을 모니터링합니다.",
      tags: ["Backup Monitoring"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "jobName",
          in: "path",
          description: "모니터링할 Backup 작업 이름",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          name: "detail",
          in: "query",
          description: "상세 정보 포함 여부 (true, false)",
          required: false,
          schema: {
            type: "boolean",
            default: false,
          },
        },
        {
          name: "mode",
          in: "query",
          description: "작업 모드 필터 (full, inc, smart)",
          required: false,
          schema: {
            type: "string",
            enum: ["full", "inc", "smart"],
          },
        },
        {
          name: "partition",
          in: "query",
          description: "특정 파티션 필터",
          required: false,
          schema: {
            type: "string",
          },
        },
        {
          name: "repositoryType",
          in: "query",
          description: "저장소 유형 필터",
          required: false,
          schema: {
            type: "string",
            enum: ["smb", "nfs", "ssh"],
          },
        },
        {
          name: "repositoryPath",
          in: "query",
          description: "저장소 경로 필터",
          required: false,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Backup 작업 모니터링 정보 조회 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupMonitoringResponse"
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "404": {
          $ref: "#/components/responses/NotFound"
        },
        "500": {
          $ref: "#/components/responses/ServerError"
        }
      }
    }
  },
  "/backups/job-id/{jobId}/monitoring": {
    get: {
      summary: "작업 ID로 Backup 모니터링",
      description: "특정 ID의 백업 작업 진행 상황을 모니터링합니다.",
      tags: ["Backup Monitoring"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "jobId",
          in: "path",
          description: "모니터링할 Backup 작업 ID",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
        },
        {
          name: "detail",
          in: "query",
          description: "상세 정보 포함 여부 (true, false)",
          required: false,
          schema: {
            type: "boolean",
            default: false,
          },
        },
        {
          name: "mode",
          in: "query",
          description: "작업 모드 필터 (full, inc, smart)",
          required: false,
          schema: {
            type: "string",
            enum: ["full", "inc", "smart"],
          },
        },
        {
          name: "partition",
          in: "query",
          description: "특정 파티션 필터",
          required: false,
          schema: {
            type: "string",
          },
        },
        {
          name: "repositoryType",
          in: "query",
          description: "저장소 유형 필터",
          required: false,
          schema: {
            type: "string",
            enum: ["smb", "nfs", "ssh"],
          },
        },
        {
          name: "repositoryPath",
          in: "query",
          description: "저장소 경로 필터",
          required: false,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Backup 작업 모니터링 정보 조회 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupMonitoringResponse"
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "404": {
          $ref: "#/components/responses/NotFound"
        },
        "500": {
          $ref: "#/components/responses/ServerError"
        }
      }
    }
  },
  "/backups/server-name/{serverName}/monitoring": {
    get: {
      summary: "서버 이름으로 Backup 모니터링",
      description: "특정 서버의 모든 백업 작업 진행 상황을 모니터링합니다.",
      tags: ["Backup Monitoring"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "serverName",
          in: "path",
          description: "모니터링할 서버 이름",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          name: "detail",
          in: "query",
          description: "상세 정보 포함 여부 (true, false)",
          required: false,
          schema: {
            type: "boolean",
            default: false,
          },
        },
        {
          name: "mode",
          in: "query",
          description: "작업 모드 필터 (full, inc, smart)",
          required: false,
          schema: {
            type: "string",
            enum: ["full", "inc", "smart"],
          },
        },
        {
          name: "partition",
          in: "query",
          description: "특정 파티션 필터",
          required: false,
          schema: {
            type: "string",
          },
        },
        {
          name: "serverType",
          in: "query",
          description: "서버 유형 필터",
          required: false,
          schema: {
            type: "string",
          },
        },
        {
          name: "repositoryType",
          in: "query",
          description: "저장소 유형 필터",
          required: false,
          schema: {
            type: "string",
            enum: ["smb", "nfs", "ssh"],
          },
        },
        {
          name: "repositoryPath",
          in: "query",
          description: "저장소 경로 필터",
          required: false,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Backup 작업 모니터링 정보 조회 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupMonitoringListResponse"
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest"
        },
        "401": {
          $ref: "#/components/responses/Unauthorized"
        },
        "404": {
          $ref: "#/components/responses/NotFound"
        },
        "500": {
          $ref: "#/components/responses/ServerError"
        }
      }
    }
  }
}