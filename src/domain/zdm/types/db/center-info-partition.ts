//////////////////////////////////////////////
//  center_info_partition table 스키마 정의  //
//////////////////////////////////////////////

export interface ZdmInfoPartitionTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nDiskNum: number
  nPartitionNum: number
  nPartSize: number
  nPartUsed: number
  nPartFree: number
  sLetter: string
  sCaption: string
  sDevice: string
  sFileSystem: string
  sFlag: string
  sLastUpdateTime: string
  nFlags: number
}
