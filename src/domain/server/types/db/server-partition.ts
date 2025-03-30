/////////////////////////////////////////
//  server_partition table 스키마 정의  //
/////////////////////////////////////////

export interface ServerPartitionTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nDiskNum: number
  nPartitionNum: number
  nPartSize: number //  단위: byte
  nPartUsed: number //  단위: byte
  nPartFree: number //  단위: byte
  sLetter: string
  sCaption: string //  윈도우 전용
  sDevice: string //  리눅스 전용
  sFileSystem: string
  sFlag: string
  sLastUpdateTime: string
  nFlags: number
}
