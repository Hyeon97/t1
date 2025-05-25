///////////////////////////////////////////
//  job_interactive table interface 정의 //
///////////////////////////////////////////

/**
 * job_interactive table 스키마 정의
 */
export interface JobInteractiveTable {
  nID: number
  nUserID: number
  nGroupID: number
  nCenterID: number
  sSystemName: string
  nJobStatus: number //  작업 진행상태(1:진행, 2:완료, 3:대기)
  nJobType: number
  nJobID: number
  sJobData: string
  sJobResult: string
  sDescription: string
  nJobResultID: number
  sLastUpdateTime: string
  nRequestID: number
}
