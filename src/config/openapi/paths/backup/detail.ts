/**
 * Backup 상세 조회 API 경로 정의
 */
export const backupDetailPath = {
  // 작업 ID로 Backup 조회
  "/backups/job-id/{jobId}": {
    get: {
      summary: "작업 ID로 Backup 조회",
      description: "특정 ID를 가진 백업 작업의 상세 정보를 조회합니다.",
      tags: ["Backup Management"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "jobId",
          in: "path",
          description: "조회할 Backup 작업 ID",
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
            default: true,
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
          name: "result",
          in: "query",
          description: "작업 결과 필터",
          required: false,
          schema: {
            type: "string",
            enum: ["success", "failure", "partial", "unknown"],
          },
        },
      ],
      responses: {
        "200": {
          description: "Backup 작업 조회 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupListResponse"
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest",
        },
        "401": {
          $ref: "#/components/responses/Unauthorized",
        },
        "404": {
          $ref: "#/components/responses/NotFound",
        },
        "500": {
          $ref: "#/components/responses/ServerError",
        },
      },
    },
  },

  // 작업 이름으로 Backup 조회
  "/backups/job-name/{jobName}": {
    get: {
      summary: "작업 이름으로 Backup 조회",
      description: "특정 이름을 가진 백업 작업의 상세 정보를 조회합니다.",
      tags: ["Backup Management"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "jobName",
          in: "path",
          description: "조회할 Backup 작업 이름",
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
            default: true,
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
          name: "result",
          in: "query",
          description: "작업 결과 필터",
          required: false,
          schema: {
            type: "string",
            enum: ["success", "failure", "partial", "unknown"],
          },
        },
      ],
      responses: {
        "200": {
          description: "Backup 작업 조회 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupListResponse"
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest",
        },
        "401": {
          $ref: "#/components/responses/Unauthorized",
        },
        "404": {
          $ref: "#/components/responses/NotFound",
        },
        "500": {
          $ref: "#/components/responses/ServerError",
        },
      },
    },
  },

  // 서버 이름으로 Backup 조회
  "/backups/server-name/{serverName}": {
    get: {
      summary: "서버 이름으로 Backup 조회",
      description: "특정 서버에 대한 백업 작업 목록을 조회합니다.",
      tags: ["Backup Management"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "serverName",
          in: "path",
          description: "조회할 서버 이름",
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
          name: "serverType",
          in: "query",
          description: "서버 타입 필터",
          required: false,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Backup 작업 조회 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupListResponse"
              }
            }
          }
        },
        "400": {
          $ref: "#/components/responses/BadRequest",
        },
        "401": {
          $ref: "#/components/responses/Unauthorized",
        },
        "404": {
          $ref: "#/components/responses/NotFound",
        },
        "500": {
          $ref: "#/components/responses/ServerError",
        },
      },
    },
  },
}