/**
 * Backup 수정 API 경로 정의
 */
export const backupEditPath = {
  // 작업 이름으로 Backup 수정
  "/backups/job-name/{jobName}": {
    put: {
      operationId: "updateBackupByJobName",
      summary: "작업 이름으로 Backup 수정",
      description: "백업 작업 정보를 수정합니다.",
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
          description: "수정할 Backup 작업 이름",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                partition: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  example: ["/", "/boot"],
                  description: "수정할 파티션 목록"
                },
                changeName: {
                  type: "string",
                  example: "prd-web01_new_backup",
                  description: "변경할 작업 이름"
                },
                type: {
                  type: "string",
                  enum: ["full", "inc", "smart"],
                  example: "full",
                  description: "변경할 백업 작업 타입"
                },
                status: {
                  type: "string",
                  enum: ["connect", "disconnect"],
                  example: "connect",
                  description: "변경할 작업 상태"
                },
                description: {
                  type: "string",
                  example: "주간 백업으로 변경",
                  description: "변경할 작업 설명"
                },
                rotation: {
                  type: "number",
                  minimum: 1,
                  maximum: 30,
                  example: 3,
                  description: "변경할 백업 보관 횟수"
                },
                compression: {
                  type: "string",
                  enum: ["use", "not use"],
                  example: "use",
                  description: "변경할 압축 사용 여부"
                },
                encryption: {
                  type: "string",
                  enum: ["use", "not use"],
                  example: "use",
                  description: "변경할 암호화 사용 여부"
                },
                excludeDir: {
                  type: "string",
                  example: "/var/log|/tmp",
                  description: "변경할 백업 제외 디렉터리 (| 구분자 사용)"
                },
                mailEvent: {
                  type: "string",
                  format: "email",
                  example: "admin@example.com",
                  description: "변경할 백업 이벤트 수신 이메일"
                },
                networkLimit: {
                  type: "number",
                  minimum: 0,
                  example: 1024,
                  description: "변경할 네트워크 제한 속도 (KB/s)"
                },
                schedule: {
                  type: "object",
                  properties: {
                    full: {
                      type: "string",
                      example: "1",
                      description: "변경할 전체 백업 스케줄 (ID 또는 스케줄 표현식)"
                    },
                    inc: {
                      type: "string",
                      example: "2",
                      description: "변경할 증분 백업 스케줄 (ID 또는 스케줄 표현식)"
                    }
                  },
                  description: "변경할 백업 스케줄 정보"
                },
                repository: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "14",
                      description: "변경할 저장소 ID"
                    },
                    type: {
                      type: "string",
                      enum: ["smb", "nfs", "ssh"],
                      example: "nfs",
                      description: "변경할 저장소 유형"
                    },
                    path: {
                      type: "string",
                      example: "172.25.0.83:/ZConverter/backup",
                      description: "변경할 저장소 경로"
                    }
                  },
                  description: "변경할 백업 저장소 정보"
                },
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Backup 작업 수정 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupEditResponse"
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

  // 작업 ID로 Backup 수정
  "/backups/job-id/{jobId}": {
    put: {
      operationId: "updateBackupByJobId",
      summary: "작업 ID로 Backup 수정",
      description: "백업 작업 정보를 수정합니다.",
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
          description: "수정할 Backup 작업 ID",
          required: true,
          schema: {
            type: "integer",
            format: "int64",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                partition: {
                  type: "array",
                  items: {
                    type: "string"
                  },
                  example: ["/", "/boot"],
                  description: "수정할 파티션 목록"
                },
                changeName: {
                  type: "string",
                  example: "prd-web01_new_backup",
                  description: "변경할 작업 이름"
                },
                type: {
                  type: "string",
                  enum: ["full", "inc", "smart"],
                  example: "full",
                  description: "변경할 백업 작업 타입"
                },
                status: {
                  type: "string",
                  enum: ["connect", "disconnect"],
                  example: "connect",
                  description: "변경할 작업 상태"
                },
                description: {
                  type: "string",
                  example: "주간 백업으로 변경",
                  description: "변경할 작업 설명"
                },
                rotation: {
                  type: "number",
                  minimum: 1,
                  maximum: 30,
                  example: 3,
                  description: "변경할 백업 보관 횟수"
                },
                compression: {
                  type: "string",
                  enum: ["use", "not use"],
                  example: "use",
                  description: "변경할 압축 사용 여부"
                },
                encryption: {
                  type: "string",
                  enum: ["use", "not use"],
                  example: "use",
                  description: "변경할 암호화 사용 여부"
                },
                excludeDir: {
                  type: "string",
                  example: "/var/log|/tmp",
                  description: "변경할 백업 제외 디렉터리 (| 구분자 사용)"
                },
                mailEvent: {
                  type: "string",
                  format: "email",
                  example: "admin@example.com",
                  description: "변경할 백업 이벤트 수신 이메일"
                },
                networkLimit: {
                  type: "number",
                  minimum: 0,
                  example: 1024,
                  description: "변경할 네트워크 제한 속도 (KB/s)"
                },
                schedule: {
                  type: "object",
                  properties: {
                    full: {
                      type: "string",
                      example: "1",
                      description: "변경할 전체 백업 스케줄 (ID 또는 스케줄 표현식)"
                    },
                    inc: {
                      type: "string",
                      example: "2",
                      description: "변경할 증분 백업 스케줄 (ID 또는 스케줄 표현식)"
                    }
                  },
                  description: "변경할 백업 스케줄 정보"
                },
                repository: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "14",
                      description: "변경할 저장소 ID"
                    },
                    type: {
                      type: "string",
                      enum: ["smb", "nfs", "ssh"],
                      example: "nfs",
                      description: "변경할 저장소 유형"
                    },
                    path: {
                      type: "string",
                      example: "172.25.0.83:/ZConverter/backup",
                      description: "변경할 저장소 경로"
                    }
                  },
                  description: "변경할 백업 저장소 정보"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Backup 작업 수정 성공",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BackupEditResponse"
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