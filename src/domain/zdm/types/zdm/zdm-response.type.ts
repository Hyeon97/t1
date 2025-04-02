//////////////////////////////
//  ZDM 정보 조회 응답 정의  //
//////////////////////////////

import { ZdmDiskInfoDTO } from "../../dto/disk/zdm.disk.dto"
import { ZdmNetworkInfoDTO } from "../../dto/network/zdm.network.dto"
import { ZdmPartitionInfoDTO } from "../../dto/partition/zdm.partition.dto"
import { ZdmRepositoryInfoDTO } from "../../dto/repository/zdm.repository.dto"
import { ZdmInfoTable } from "../db/center-info"
import { ZdmInfoDiskTable } from "../db/center-info-disk"
import { ZdmInfoNetworkTable } from "../db/center-info-network"
import { ZdmInfoPartitionTable } from "../db/center-info-partition"
import { ZdmRepositoryTable } from "../db/center-repository"
import { ZdmZosRepositoryTable } from "../db/center-zos-repository"

export type ArrayPropertyName = "disk" | "network" | "partition" | "repository" | "zosRepository"
/**
 * ZDM 기본 정보 응답 필드 인터페이스
 */
export interface ZdmResponseBaseFields {
  centerName: string
  hostName: string
  ip: string
  state: string
  activation: string
  disk?: ZdmDiskInfoDTO[]
  network?: ZdmNetworkInfoDTO[]
  partition?: ZdmPartitionInfoDTO[]
  repository?: ZdmRepositoryInfoDTO[]
  zosRepository?: any[]
}

/**
 * ZDM 상세 정보 응답 필드 인터페이스
 */
export interface ZdmResponseDetailFields extends ZdmResponseBaseFields {
  centerVersion: string
  osVersion: string
  model: string
  privateIP: string
  organization: string
  manufacturer: string
  sytemType: string
  cpu: string
  cpuCount: string
  memory: string
  machineID: string
}

/**
 * ZDM 정보 조회 리턴 기본값 상수 정의
 */
export const DEFAULT_VALUES_ZDM_RESPONSE = {
  centerName: "",
  hostName: "",
  ip: "-",
  state: "Unknown",
  activation: "Unknown",
  centerVersion: "Unknown",
  osVersion: "Unknown",
  model: "Unknown",
  privateIP: "-",
  organization: "Unknown",
  manufacturer: "Unknown",
  sytemType: "Unknown",
  cpu: "Unknown",
  cpuCount: "0",
  memory: "0",
  machineID: "Unknown",
  disk: [],
  network: [],
  partition: [],
  repository: [],
  zosRepository: [],
}

/**
 * ZDM 조회 결과 서비스 리턴 타입
 */
export interface ZdmDataResponse {
  zdm: ZdmInfoTable
  disk?: ZdmInfoDiskTable[]
  partition?: ZdmInfoPartitionTable[]
  network?: ZdmInfoNetworkTable[]
  repository?: ZdmRepositoryTable[]
  zosRepository?: ZdmZosRepositoryTable[]
}
