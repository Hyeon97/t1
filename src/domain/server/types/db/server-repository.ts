//////////////////////////////////////////
//  server_repository table 스키마 정의  //
//////////////////////////////////////////

import { OSTypeEnum } from "../../../../types/common/os"
import { ServerRepositoryTypeEnum } from "../server-common.type"

export interface ServerRepositoryTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nOS: OSTypeEnum //  운영체제 종류(1: Windows, 2:Linux, 3:cloud)
  nType: ServerRepositoryTypeEnum //  저장소 타입(1: 소스서버, 2:타겟서버, 10:VSM서버, 20: Network, 30: Cloud Storage, 99: 알수없음)
  nUsedSize: number //   단위: byte
  nFreeSize: number //   단위: byte
  sLocalPath: string
  sRemotePath: string
  sRemoteUser: string
  sRemotePwd: string
  sRemoteDomain: string
  sIPAddress: string
  sZConverterIPAddress: string
  nZConverterPort: number
  sCloudConnectInfo: string
  sLastUpdateTime: string
  nFlags: number
}
