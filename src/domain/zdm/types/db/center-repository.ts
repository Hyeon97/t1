//////////////////////////////////////////
//  center_repository table 스키마 정의  //
//////////////////////////////////////////

import { OSTypeEnum } from "../../../../types/common/os"
import { RepositoryEnum } from "../../../../types/common/repository"

export interface ZdmRepositoryTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nOS: OSTypeEnum // 운영체제 종류(1: Windows, 2:Linux)
  nType: RepositoryEnum //  저장소 타입(1: 자기자신, 20: Network(SMB), 21: Network(NFS))
  nUsedSize: number // 단위: byte
  nFreeSize: number // 단위: byte
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
}
