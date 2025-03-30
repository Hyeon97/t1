////////////////////////////////////
//  server_disk table 스키마 정의  //
////////////////////////////////////

import { DiskTypeEnum } from "../../../../types/common/disk"

export interface ServerDiskTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nDiskType: DiskTypeEnum //  디스크 타입(0:bios, 1:gpt)
  nDiskNum: number
  sDiskSize: string
  sDiskCaption: string
  sDevice: string
  sProduct: string
  sVender: string
  sLastUpdateTime: string
  nFlags: number
}
