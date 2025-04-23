/**
 * Backup 삭제 API 경로 정의
 */
export const backupDeletePath = {
  "/backups/job-id/{jobId}": {
    delete: {
      summary: "작업 ID로 Backup 삭제",
      description: "특정 ID의 백업 작업을 삭제합니다.",
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
          description: "삭제할 Backup 작업 ID",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
        },
      ],
      responses: {
        "200": {
          description: "Backup 작업 삭제 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupDeleteResponse"
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
  "/backups/job-name/{jobName}": {
    delete: {
      summary: "작업 이름으로 Backup 삭제",
      description: "특정 이름의 백업 작업을 삭제합니다.",
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
          description: "삭제할 Backup 작업 이름",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        "200": {
          description: "Backup 작업 삭제 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupDeleteResponse"
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