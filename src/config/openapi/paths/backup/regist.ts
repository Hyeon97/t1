/**
 * Backup 등록 API 경로 정의
 */
export const backupRegistPath = {
  "/backups": {
    post: {
      summary: "Backup 작업 등록",
      description: "새로운 백업 작업을 등록합니다.",
      tags: ["Backup Management"],
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["center", "server", "type", "partition", "repository"],
              properties: {
                center: {
                  oneOf: [
                    { type: "number", description: "센터 ID" },
                    { type: "string", description: "센터 이름" }
                  ],
                  example: 1,
                  description: "작업을 등록할 센터 ID 또는 이름"
                },
                server: {
                  oneOf: [
                    { type: "number", description: "서버 ID" },
                    { type: "string", description: "서버 이름" }
                  ],
                  example: "prd-web01 (172.25.0.11)",
                  description: "백업 대상 서버 ID 또는 이름"
                },
                type: {
                  type: "string",
                  enum: ["full", "inc", "smart"],
                  example: "full",
                  description: "백업 작업 타입"
                },
                partition: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  example: ["/", "/boot", "/data"],
                  description: "백업할 파티션 목록 (빈 배열인 경우 모든 파티션 백업)"
                },
                repository: {
                  type: "object",
                  required: ["id"],
                  properties: {
                    id: {
                      type: "number",
                      example: 14,
                      description: "저장소 ID"
                    },
                    type: {
                      type: "string",
                      enum: ["smb", "nfs", "ssh"],
                      example: "nfs",
                      description: "저장소 유형"
                    },
                    path: {
                      type: "string",
                      example: "172.25.0.83:/ZConverter",
                      description: "저장소 경로"
                    }
                  },
                  description: "백업 저장소 정보"
                },
                jobName: {
                  type: "string",
                  example: "prd-web01_root",
                  description: "작업 이름 (없을 경우 자동 생성)"
                },
                user: {
                  oneOf: [
                    { type: "number", description: "사용자 ID" },
                    { type: "string", format: "email", description: "사용자 이메일" }
                  ],
                  example: "admin@example.com",
                  description: "작업 소유자"
                },
                schedule: {
                  type: "object",
                  properties: {
                    full: {
                      type: "number",
                      example: 0,
                      description: "전체 백업 스케줄 ID"
                    },
                    inc: {
                      type: "number",
                      example: 0,
                      description: "증분 백업 스케줄 ID"
                    }
                  },
                  description: "백업 스케줄 정보"
                },
                descroption: {
                  type: "string",
                  example: "월간 전체 백업",
                  description: "작업 설명"
                },
                rotation: {
                  type: "number",
                  minimum: 1,
                  maximum: 30,
                  example: 1,
                  description: "백업 보관 횟수"
                },
                compression: {
                  type: "string",
                  enum: ["use", "not use"],
                  example: "use",
                  description: "압축 사용 여부"
                },
                encryption: {
                  type: "string",
                  enum: ["use", "not use"],
                  example: "not use",
                  description: "암호화 사용 여부"
                },
                excludeDir: {
                  type: "string",
                  example: "/var/log|/var/cache",
                  description: "백업 제외 디렉터리 (| 구분자 사용)"
                },
                excludePartition: {
                  type: "string",
                  example: "/tmp",
                  description: "백업 제외 파티션 (| 구분자 사용)"
                },
                mailEvent: {
                  type: "string",
                  format: "email",
                  example: "admin@example.com",
                  description: "백업 이벤트 수신 이메일"
                },
                networkLimit: {
                  type: "number",
                  minimum: 0,
                  example: 0,
                  description: "네트워크 제한 속도 (0: 무제한)"
                },
                autoStart: {
                  type: "string",
                  enum: ["use", "not use"],
                  example: "not use",
                  description: "자동 시작 여부"
                }
              }
            }
          }
        }
      },
      responses: {
        "201": {
          description: "Backup 작업 등록 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupRegistResponse"
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
        "500": {
          $ref: "#/components/responses/ServerError"
        }
      }
    }
  }
}