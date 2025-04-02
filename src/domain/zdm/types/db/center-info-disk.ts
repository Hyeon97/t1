/////////////////////////////////////////
//  center_info_disk table 스키마 정의  //
/////////////////////////////////////////

import { DiskTypeEnum } from "../../../../types/common/disk"

export interface ZdmInfoDiskTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nDiskType: DiskTypeEnum //  디스크 타입(0:bios, 1:gpt)
  nDiskNum: number
  sDiskSize: string
  sDiskCaption: string
  sLastUpdateTime: string
  nFlags: number
}
