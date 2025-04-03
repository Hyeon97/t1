//////////////////////////////////
//  Backup Service 선언 및 관리  //
//////////////////////////////////

import { ServerBasicRepository } from "./../repositories/server-basic.repository"
import { ServerDiskRepository } from "./../repositories/server-disk.repository"
import { ServerNetworkRepository } from "./../repositories/server-network.repository"
import { ServerPartitionRepository } from "./../repositories/server-partition.repository"
import { ServerRepositoryRepository } from "./../repositories/server-repository.repository"
// import { ServerService } from "./backup.service"

// 리포지토리 인스턴스 생성
const serverBasicRepository = new ServerBasicRepository()
const serverDiskRepository = new ServerDiskRepository()
const serverPartitionRepository = new ServerPartitionRepository()
const serverNetworkRepository = new ServerNetworkRepository()
const serverRepositoryRepository = new ServerRepositoryRepository()

// 서비스 인스턴스 생성 및 의존성 주입
// export const serverService = new ServerService({
//   serverBasicRepository,
//   serverDiskRepository,
//   serverPartitionRepository,
//   serverNetworkRepository,
//   serverRepositoryRepository,
// })
