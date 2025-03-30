/**
 * 서버 관련 모든 경로를 통합
 */

import { serverListPath } from "./list"
import { serverDeletePath } from "./delete"

export const serverPaths = {
  ...serverListPath,
  ...serverDeletePath,
}
