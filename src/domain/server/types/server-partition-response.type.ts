///////////////////////////////////////////
//  server partition 조회 응답 type 정의  //
///////////////////////////////////////////

import { ServerPartitionTable } from "./db/server-partition"

/**
 * server partition 조회 결과 서비스 리턴 인터페이스
 */
export interface ServerPartitionDataResponse {
  items: ServerPartitionTable[]
}
