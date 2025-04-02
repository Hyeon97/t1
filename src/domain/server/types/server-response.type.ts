/////////////////////////////////
//  server 정보 조회 응답 type  //
/////////////////////////////////

import { ServerDiskInfoDTO } from "../dto/disk/server.disk.dto"
import { ServerNetworkInfoDTO } from "../dto/network/server.network.dto"
import { ServerPartitionInfoDTO } from "../dto/partition/server.partition.dto"
import { ServerBasicTable } from "./db/server-basic"
import { ServerDiskTable } from "./db/server-disk"
import { ServerNetworkTable } from "./db/server-network"
import { ServerPartitionTable } from "./db/server-partition"
import { ServerRepositoryTable } from "./db/server-repository"

// 배열 속성 이름 타입 정의 (타입 안전성 향상)
export type ArrayPropertyName = "disk" | "network" | "partition" | "repository"

/**
 * 서버 기본 정보 응답 필드 인터페이스
 */
export interface ServerResponseBaseFields {
  id: string
  systemName: string
  systemMode: string
  os: string
  version: string
  ip: string
  status: string
  licenseID: string | number
  lastUpdated: string
  disk?: ServerDiskInfoDTO[]
  network?: ServerNetworkInfoDTO[]
  partition?: ServerPartitionInfoDTO[]
  repository?: any[]
}

/**
 * 서버 상세 정보 응답 필드 인터페이스
 */
export interface ServerResponseDetailFields extends ServerResponseBaseFields {
  agent: string
  model: string
  manufacturer: string
  cpu: string
  cpuCount: string
  memory: string
}

/**
 * 서버 정보 조회 리턴 기본값 상수 정의
 */
export const DEFAULT_VALUES_SERVER_RESPONSE = {
  id: "-",
  systemName: "-",
  systemMode: "Unknown",
  agent: "Unknown",
  model: "Unknown",
  manufacturer: "Unknown",
  os: "Unknown",
  version: "Unknown",
  ip: "-",
  cpu: "Unknown",
  cpuCount: "0",
  memory: "0",
  status: "Unknown",
  licenseID: "Unassigned",
  lastUpdated: "-",
  disk: [],
  network: [],
  partition: [],
  repository: [],
}

/**
 * server 조회 결과 서비스 리턴 인터페이스
 */
export interface ServerDataResponse {
  server: ServerBasicTable
  disk?: ServerDiskTable[]
  partition?: ServerPartitionTable[]
  network?: ServerNetworkTable[]
  repository?: ServerRepositoryTable[]
}
