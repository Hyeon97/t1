//  OS
export const VALID_OS_VALUES = ["win", "lin", "cloud"] as const
//  Server Or Center OS
export const VALID_SYSTEM_MODE_VALUES = ["source", "target"] as const
//  Server Or Center 연결 상태
export const VALID_STATE_VALUES = ["connect", "disconnect"] as const
//  Center 활성화 상태
export const VALID_CENTER_ACTIVATION_VALUES = ["ok", "fail"] as const
//  Server License 할당 상태
export const VALID_LICENSE_VALUES = ["assign", "unassign"] as const
//  Repository 타입
export const VALID_REPOSITORY_VALUES = ["smb", "nfs", "ssh"] as const
//  압축 옵션 사용 여부
export const VALID_COMPRESSION_VALUES = ["use", "not use"] as const
//  암호화 옵션 사용 여부
export const VALID_ENCRYPTION_VALUES = ["use", "not use"] as const
//  작업 자동 시작 여부
export const VALID_JOB_AUTOSTART_VALUES = ["use", "not use"] as const
//  작업 타입 지정
export const VALID_JOB_TYPE_VALUES = ["full", "inc", "smart"] as const
//  작업 상태
export const JOB_STATUS_VALUES = ["run", "complete", "start", "waiting", "cancel", "schedule"] as const
//  Schedule 활성화 상태
export const VALID_SCHEDULE_ACTIVATION_VALUES = ["disabled", "enabled"] as const
//  SChedule 타입
export const VALID_SCHEDULE_TYPE_VALUES = [
  "once",
  "every minute",
  "hourly",
  "daily",
  "weekly",
  "monthly on specific week",
  "monthly on specific day",
] as const
