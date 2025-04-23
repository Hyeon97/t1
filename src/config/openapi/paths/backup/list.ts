/**
 * Backup 목록 조회 API 경로 정의
 */
export const backupListPath = {
  "/backups": {
    get: {
      summary: "Backup 목록 조회",
      description: "Backup 목록을 조회합니다.",
      tags: ["Backup Management"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
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
          description: "작업 대상 파티션",
          required: false,
          schema: {
            type: "string",
          },
        },
        {
          name: "status",
          in: "query",
          description: "작업 상태 필터",
          required: false,
          schema: {
            type: "string",
            enum: ["run", "complete", "start", "waiting", "cancel", "schedule"]
          },
        },
        {
          name: "result",
          in: "query",
          description: "작업 결과 필터",
          required: false,
          schema: {
            type: "string",
            enum: [],
          },
        },
        {
          name: "repositoryID",
          in: "query",
          description: "작업 사용 Repository ID",
          required: false,
          schema: {
            type: "number",
          },
        },
        {
          name: "repositoryType",
          in: "query",
          description: "작업 사용 Repository 타입 필터",
          required: false,
          schema: {
            type: "string",
            enum: ["smb", "nfs", "ssh"],
          },
        },
        {
          name: "repositoryPath",
          in: "query",
          description: "작업 사용 Repository Path",
          required: false,
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
          },
        },
      ],
      responses: {
        200: {
          description: "Backup 목록 조회 성공",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/BackupListResponse",
                },
              },
            },
          },
        },
        400: {
          $ref: "#/components/responses/BadRequest",
        },
        401: {
          $ref: "#/components/responses/Unauthorized",
        },
        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    },
  },
}
