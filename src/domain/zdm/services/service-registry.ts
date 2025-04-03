import { ZdmDiskRepository } from "./../repositories/center-info-disk.repository"
import { ZdmNetworkRepository } from "./../repositories/center-info-network.repository"
import { ZdmPartitionRepository } from "./../repositories/center-info-partition.repository"
import { ZdmRepository } from "./../repositories/center-info.repository"
import { ZdmRepositoryRepository } from "./../repositories/center-repository.repository"
///////////////////////////////
//  ZDM Service 선언 및 관리  //
///////////////////////////////

import { ZdmZosRepositoryRepository } from "../repositories/center-zos-repository.repository"
import { ZdmService } from "./zdm.service"
import { ZdmRepositoryService } from "./zdm.repository.service"

// 리포지토리 인스턴스 생성
const zdmRepository = new ZdmRepository()
const zdmDiskRepository = new ZdmDiskRepository()
const zdmNetworkRepository = new ZdmNetworkRepository()
const zdmPartitionRepository = new ZdmPartitionRepository()
const zdmRepositoryRepository = new ZdmRepositoryRepository()
const zdmZosRepositoryRepository = new ZdmZosRepositoryRepository()

// 서비스 인스턴스 생성 및 의존성 주입
export const zdmService = new ZdmService({
  zdmRepository,
  zdmDiskRepository,
  zdmNetworkRepository,
  zdmPartitionRepository,
  zdmRepositoryRepository,
  zdmZosRepositoryRepository,
})

export const zdmRepositoryService = new ZdmRepositoryService({
  zdmRepository,
  zdmRepositoryRepository,
})
