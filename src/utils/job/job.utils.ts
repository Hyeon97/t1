//////////////////////////
//  작업 공통 사용 함수  //
//////////////////////////

import { BackupRepository } from "../../domain/backup/repositories/backup.repository"
import { ServerBasicTable } from "../../domain/server/types/db/server-basic"
import { ZdmInfoTable } from "../../domain/zdm/types/db/center-info"
import { UtilityError } from "../../errors"
import { OSTypeMap } from "../../types/common/os"
import { asyncContextStorage } from "../AsyncContext"

type JobType = 'Backup' | 'Recovery' | 'Replication'

interface PreprocessJobNameParams {
  jobName: string //  사용자가 입력한 작업 이름
  server?: ServerBasicTable //  직업이름 생성시 사용할 server 정보 
  center?: ZdmInfoTable //  작업이름 생성시 사용할 center 정보
  partition: string //  작업이름 생성시 사용할 partition 정보
  type: JobType //  작업 타입
  repository: BackupRepository  //  작업 이름 생성시 조회에 사용할 service
}

interface ChPartitionNameParams {
  server: ServerBasicTable
  partition: string
}

interface JobNameResult {
  jName: string
  idx: number
}

class JobUtils {
  private readonly utilitiName = 'job.utils'

  /**
   * 작업 이름 생성 - 파티션 값 변환
   */
  private chPartitionName({ server, partition }: ChPartitionNameParams): string {
    try {
      const os = OSTypeMap.toString({ value: server.nOS })

      if (os === 'Window') {
        return partition.replaceAll(':', '')
      }

      if (os === 'Linux') {
        return partition === '/' ? '_ROOT' : partition.replaceAll('/', '_')
      }

      return partition
    } catch (error) {
      throw UtilityError.dataProcessingError({
        method: 'chPartitionName',
        message: '[Job 이름 처리] - 파티션 양식 변환 중 오류 발생',
        error,
      })
    }
  }

  /**
   * 데이터 전처리(작업이름 중복 검사 or 자동생성)
   * backup, recovery, replication 에서 사용
   */
  async preprocessJobName({
    jobName,
    server,
    partition,
    type,
    repository,
  }: PreprocessJobNameParams): Promise<JobNameResult> {
    try {
      asyncContextStorage.addOrder({
        component: this.utilitiName,
        method: 'preprocessJobName',
        state: 'start',
      })
      let partitionName = ''
      let baseName = ''
      let matched = []

      if (type === 'Backup' || type === 'Recovery') {
        if (!server) throw new Error(`작업 타입이 ${type}인 경우 server는 필수 입니다.`)
        partitionName = this.chPartitionName({ server, partition })
        baseName = jobName ? `${jobName}${partitionName}` : `${server.sSystemName}${partitionName}`
        matched = await repository.findByJobNameUseLike({
          jobName: baseName,
          filterOptions: {},
        })
      }

      const idx = matched.length

      asyncContextStorage.addOrder({
        component: this.utilitiName,
        method: 'preprocessJobName',
        state: 'end',
      })

      return { jName: `${baseName}_idx`, idx }
    } catch (error) {
      throw UtilityError.dataProcessingError({
        method: 'preprocessJobName',
        message: `[Job 이름 처리] - ${type} Job 이름 전처리 중 오류 발생`,
        error,
      })
    }
  }
}

export const jobUtils = new JobUtils()