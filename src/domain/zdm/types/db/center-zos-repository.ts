//////////////////////////////////////////////
//  center_zos_repository table 스키마 정의  //
//////////////////////////////////////////////

export interface ZdmZosRepositoryTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nCloudKeyID: number
  sBucketName: string
  nCloudPlatform: number
  sCloudPlatform: string
  nObjectNumber: number
  sSize: string
  sCreatedTime: string
  sUpdateTime: string
}
