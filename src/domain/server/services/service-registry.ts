//////////////////////////////////
//  Server Service 선언 및 관리  //
//////////////////////////////////

import { ServerBasicRepository } from "./../repositories/server-basic.repository"
import { ServerDiskRepository } from "./../repositories/server-disk.repository"
import { ServerNetworkRepository } from "./../repositories/server-network.repository"
import { ServerPartitionRepository } from "./../repositories/server-partition.repository"
import { ServerRepositoryRepository } from "./../repositories/server-repository.repository"
import { ServerPartitionService } from "./server-partition.service"
import { ServerGetService } from "./server-get.service"

/**
 * 리포지토리 인스턴스 생성
 */
const serverBasicRepository = new ServerBasicRepository()
const serverDiskRepository = new ServerDiskRepository()
const serverPartitionRepository = new ServerPartitionRepository()
const serverNetworkRepository = new ServerNetworkRepository()
const serverRepositoryRepository = new ServerRepositoryRepository()

/**
 * 서비스 인스턴스 생성 및 의존성 주입
 */
//  Server 정보 조회 Service
export const serverGetService = new ServerGetService({
  serverBasicRepository,
  serverDiskRepository,
  serverPartitionRepository,
  serverNetworkRepository,
  serverRepositoryRepository,
})
//  Server Partition 정보 조회 Service
export const serverPartitionService = new ServerPartitionService({
  serverBasicRepository,
  serverPartitionRepository,
})
