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
            },
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
          required: ["id", "jobName", "systemName", "partition", "mode", "result", "schedule", "repository", "timestamp", "lastUpdate"]
        },
        description: "기본 백업 항목 목록. detail=true 쿼리 파라미터가 사용되면 option 필드가 포함됩니다."
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:02:17.569Z"
      }
    },
    required: ["requestID", "message", "success", "data", "timestamp"]
  },

  // Backup 작업 등록 응답 스키마
  BackupRegistResponse: {
    type: "object",
    properties: {
      requestID: {
        type: "string",
        example: "9e562891-3c21-40ed-a145-c99910cf6197"
      },
      message: {
        type: "string",
        example: "Backup job data regist result"
      },
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            state: {
              type: "string",
              enum: ["success", "fail"],
              example: "success"
            },
            job_name: {
              type: "string",
              example: "prd-web01_ROOT_1"
            },
            partition: {
              type: "string",
              example: "/"
            },
            job_type: {
              type: "string",
              example: "Full Backup"
            },
            auto_start: {
              type: "string",
              example: "not use"
            },
            use_schedule: {
              type: "string",
              example: "-"
            }
          },
          required: ["state", "job_name", "partition", "job_type", "auto_start", "use_schedule"]
        }
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:02:17.569Z"
      }
    },
    required: ["requestID", "message", "success", "data", "timestamp"]
  },

  // Backup 작업 수정 응답 스키마
  BackupEditResponse: {
    type: "object",
    properties: {
      requestID: {
        type: "string",
        example: "9e562891-3c21-40ed-a145-c99910cf6197"
      },
      message: {
        type: "string",
        example: "Backup job data edit result"
      },
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          job_name: {
            type: "string",
            example: "prd-web01_new_backup"
          },
          job_id: {
            type: "string",
            example: "75"
          },
          changedFields: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["JobName", "Rotation", "Compression"]
          }
        },
        required: ["job_name", "job_id", "changedFields"]
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:02:17.569Z"
      }
    },
    required: ["requestID", "message", "success", "data", "timestamp"]
  },

  // Backup 작업 삭제 응답 스키마
  BackupDeleteResponse: {
    type: "object",
    properties: {
      requestID: {
        type: "string",
        example: "9e562891-3c21-40ed-a145-c99910cf6197"
      },
      message: {
        type: "string",
        example: "Backup job data delete result"
      },
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          job_name: {
            type: "string",
            example: "prd-web01_ROOT_1"
          },
          job_id: {
            type: "string",
            example: "75"
          },
          delete_state: {
            type: "object",
            properties: {
              data: {
                type: "string",
                enum: ["success", "fail"],
                example: "success"
              },
              log: {
                type: "string",
                enum: ["success", "fail"],
                example: "success"
              },
              history: {
                type: "string",
                enum: ["success", "fail"],
                example: "success"
              }
            },
            required: ["data", "log", "history"]
          }
        },
        required: ["delete_state"]
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:02:17.569Z"
      }
    },
    required: ["requestID", "message", "success", "data", "timestamp"]
  },

  // Backup 작업 모니터링 응답 스키마
  BackupMonitoringResponse: {
    type: "object",
    properties: {
      requestID: {
        type: "string",
        example: "9e562891-3c21-40ed-a145-c99910cf6197"
      },
      message: {
        type: "string",
        example: "Backup information list"
      },
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "object",
        properties: {
          job_name: {
            type: "string",
            example: "prd-web01_ROOT_1"
          },
          job_id: {
            type: "string",
            example: "75"
          },
          monitoring_data: {
            type: "object",
            properties: {
              SystemName: {
                type: "string",
                example: "prd-web01 (172.25.0.11)"
              },
              JobName: {
                type: "string",
                example: "prd-web01_ROOT_1"
              },
              JobID: {
                type: "number",
                example: 75
              },
              JobResult: {
                type: "string",
                example: "RUNNING"
              },
              JobStatusType: {
                type: "number",
                example: 3
              },
              BackupType: {
                type: "string",
                example: "300"
              },
              Drive: {
                type: "string",
                example: "/"
              },
              Percent: {
                type: "string",
                example: "72"
              },
              StartTime: {
                type: "string",
                example: "2025-02-19T10:59:10.000Z"
              },
              ElapsedTime: {
                type: "string",
                example: "0 day, 00:02:12"
              },
              EndTime: {
                type: "string",
                example: "-"
              }
            },
            required: ["SystemName", "JobName", "JobID", "JobResult", "BackupType", "Drive", "Percent", "StartTime", "ElapsedTime"]
          }
        },
        required: ["job_name", "job_id", "monitoring_data"]
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:02:17.569Z"
      }
    },
    required: ["requestID", "message", "success", "data", "timestamp"]
  },

  // 서버 이름으로 모니터링 응답 스키마 (여러 작업 목록)
  BackupMonitoringListResponse: {
    type: "object",
    properties: {
      requestID: {
        type: "string",
        example: "9e562891-3c21-40ed-a145-c99910cf6197"
      },
      message: {
        type: "string",
        example: "Backup information list"
      },
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "array",
        items: {
          type: "object",
          properties: {
            job_name: {
              type: "string",
              example: "prd-web01_ROOT_1"
            },
            job_id: {
              type: "string",
              example: "75"
            },
            monitoring_data: {
              type: "object",
              properties: {
                SystemName: {
                  type: "string",
                  example: "prd-web01 (172.25.0.11)"
                },
                JobName: {
                  type: "string",
                  example: "prd-web01_ROOT_1"
                },
                JobID: {
                  type: "number",
                  example: 75
                },
                JobResult: {
                  type: "string",
                  example: "RUNNING"
                },
                JobStatusType: {
                  type: "number",
                  example: 3
                },
                BackupType: {
                  type: "string",
                  example: "300"
                },
                Drive: {
                  type: "string",
                  example: "/"
                },
                Percent: {
                  type: "string",
                  example: "72"
                },
                StartTime: {
                  type: "string",
                  example: "2025-02-19T10:59:10.000Z"
                },
                ElapsedTime: {
                  type: "string",
                  example: "0 day, 00:02:12"
                },
                EndTime: {
                  type: "string",
                  example: "-"
                }
              },
              required: ["SystemName", "JobName", "JobID", "JobResult", "BackupType", "Drive", "Percent", "StartTime", "ElapsedTime"]
            }
          },
          required: ["job_name", "job_id", "monitoring_data"]
        }
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-03-30T18:02:17.569Z"
      }
    },
    required: ["requestID", "message", "success", "data", "timestamp"]
  }
}