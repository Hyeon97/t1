///////////////////////////////
//  ZDM Service 선언 및 관리  //
///////////////////////////////

import { ZdmZosRepositoryRepository } from "../repositories/center-zos-repository.repository"
import { ZdmDiskRepository } from "./../repositories/center-info-disk.repository"
import { ZdmNetworkRepository } from "./../repositories/center-info-network.repository"
import { ZdmPartitionRepository } from "./../repositories/center-info-partition.repository"
import { ZdmRepository } from "./../repositories/center-info.repository"
import { ZdmRepositoryRepository } from "./../repositories/center-repository.repository"
import { ZdmRepositoryGetService } from "./repository/zdm.repository-get.service"
import { ZdmGetService } from "./common/zdm-get.service"

/**
 * 리포지토리 인스턴스 생성
 */
const zdmRepository = new ZdmRepository()
const zdmDiskRepository = new ZdmDiskRepository()
const zdmNetworkRepository = new ZdmNetworkRepository()
const zdmPartitionRepository = new ZdmPartitionRepository()
const zdmRepositoryRepository = new ZdmRepositoryRepository()
const zdmZosRepositoryRepository = new ZdmZosRepositoryRepository()

/**
 * 서비스 인스턴스 생성 및 의존성 주입
 */
//  ZDM 정보 조회 Service
export const zdmGetService = new ZdmGetService({
  zdmRepository,
  zdmDiskRepository,
  zdmNetworkRepository,
  zdmPartitionRepository,
  zdmRepositoryRepository,
  zdmZosRepositoryRepository,
})
///  ZDM Repository 정보 조회 Service
export const zdmRepositoryGetService = new ZdmRepositoryGetService({
  zdmRepository,
  zdmRepositoryRepository,
})
