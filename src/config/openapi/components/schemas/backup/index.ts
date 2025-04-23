/**
 * Backup 관련 모든 스키마 통합
 */

import { backupResponseSchema } from "./response"

export const backupSchemas = {
  ...backupResponseSchema
}