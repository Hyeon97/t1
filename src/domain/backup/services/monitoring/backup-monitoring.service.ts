import { ServiceError } from "../../../../errors"
import { JobStatusMap } from "../../../../types/common/job"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseService } from "../../../../utils/base/base-service"
import { DateTimeUtils } from "../../../../utils/Dayjs.utils"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { ServerPartitionService } from "../../../server/services/server-partition.service"
import { ServerPartitionTable } from "../../../server/types/db/server-partition"
import { BackupActiveRepository } from "../../repositories/backup-active.repository"
import { BackupInfoRepository } from "../../repositories/backup-info.repository"
import { BackupLogRepository } from "../../repositories/backup-log-event.repository"
import { BackupRepository } from "../../repositories/backup.repository"
import { BackupTypeMap } from "../../types/backup-common.type"
import { BackupMonitoringFilterOptions } from "../../types/backup-monitoring.type"
import { BackupDataMonitoringResponse } from "../../types/backup-response.type"
import { BackupActiveTable } from "../../types/db/active-backup"
import { BackupTable } from "../../types/db/job-backup"
import { BackupInfoTable } from "../../types/db/job-backup-info"
import { BackupLogEventTable } from "../../types/db/log-event-backup"

type JobName = { jobName: string, filterOptions: any }
type JobId = { jobId: number, filterOptions: any }
type ServerName = { serverName: string, filterOptions: any }

interface PartitionBackupMapping {
  partition: string
  backup: BackupTable | null
  backupInfo: BackupInfoTable | null
  backupActive: BackupActiveTable | null
  logMessages: BackupLogEventTable[]
}

export class BackupMonitoringGetService extends BaseService {
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository
  private readonly backupActiveRepository: BackupActiveRepository
  private readonly backupLogRepository: BackupLogRepository
  private readonly serverPartitionService: ServerPartitionService

  constructor({
    backupRepository,
    backupInfoRepository,
    backupActiveRepository,
    backupLogRepository,
    serverPartitionService
  }: {
    backupRepository: BackupRepository
    backupInfoRepository: BackupInfoRepository
    backupActiveRepository: BackupActiveRepository
    backupLogRepository: BackupLogRepository
    serverPartitionService: ServerPartitionService
  }) {
    super({
      serviceName: "BackupMonitoringGetService",
    })
    this.backupRepository = backupRepository
    this.backupInfoRepository = backupInfoRepository
    this.backupActiveRepository = backupActiveRepository
    this.backupLogRepository = backupLogRepository
    this.serverPartitionService = serverPartitionService
  }

  /**
   * 로그 메시지 가공
   */
  private processLogMessages({ logMessages }: { logMessages: BackupLogEventTable[] }): string[] {
    const processedLogs: string[] = []
    logMessages.forEach((log: BackupLogEventTable) => {
      processedLogs.push(`[${DateTimeUtils.formatISOString({ isoString: log.sEventTime })}]${log.sDescription}`)
    })
    return processedLogs
  }

  /**
   * 백업 응답 객체 생성
   */
  private createBackupResponse({
    backup,
    backupInfo,
    backupActive,
    processedLogs
  }: {
    backup: BackupTable
    backupInfo: BackupInfoTable
    backupActive: BackupActiveTable | null
    processedLogs: string[]
  }): BackupDataMonitoringResponse {
    return {
      system: {
        name: backup.sSystemName
      },
      job: {
        name: backup.sJobName,
        id: String(backup.nJobID),
        backup_type: backupInfo ? BackupTypeMap.toString({ value: backupInfo.nBackupType }) : "-",
        drive: backupInfo ? backupInfo.sDrive : "-",
      },
      state: {
        status: JobStatusMap.toString({ value: backup.nJobStatus }),
        percent: backupActive ? `${String(backupActive.nPercent)}%` : "-",
        result: backup.sJobResult || "-",
        description: backup.sDescription || backupActive?.sProcessMsg || '-',
      },
      time: {
        start: DateTimeUtils.formatISOString({ isoString: backup.sStartTime as string || backupActive?.sStartTime || '' }),
        elapsed: backup.sElapsedTime || backupActive?.sElapsedTime || '-',
        end: backup.sEndTime || backupActive?.sEndTime || '-',
      },
      log: processedLogs
    }
  }

  /**
   * 빈 백업 응답 객체 생성 (데이터가 없는 경우)
   */
  private createEmptyBackupResponse({
    serverName,
    partition
  }: {
    serverName: string
    partition: string
  }): BackupDataMonitoringResponse {
    return {
      system: {
        name: serverName
      },
      job: {
        name: '-',
        id: '-',
        backup_type: '-',
        drive: partition,
      },
      state: {
        status: 'No Data',
        percent: '-',
        result: '-',
        description: `No backup information found for partition ${partition}`,
      },
      time: {
        start: '-',
        elapsed: '-',
        end: '-',
      },
      log: []
    }
  }

  /**
   * 검색 매개변수 생성
   */
  private createSearchParams({
    identifier,
    searchType,
    filterOptions
  }: {
    identifier: string | number
    searchType: 'jobName' | 'jobId' | 'serverName'
    filterOptions?: BackupMonitoringFilterOptions
  }): JobName | JobId | ServerName {
    switch (searchType) {
      case 'jobName':
        return { jobName: identifier as string, filterOptions } as JobName
      case 'jobId':
        return { jobId: identifier as number, filterOptions } as JobId
      case 'serverName':
        return { serverName: identifier as string, filterOptions } as ServerName
    }
  }

  /**
   * BackupRepository 검색 실행
   */
  private async executeBackupRepositorySearch({
    searchType,
    searchParams
  }: {
    searchType: 'jobName' | 'jobId' | 'serverName'
    searchParams: JobName | JobId | ServerName
  }): Promise<BackupTable[]> {
    switch (searchType) {
      case 'jobName':
        return this.backupRepository.findByJobName(searchParams as JobName)
      case 'jobId':
        return this.backupRepository.findByJobId(searchParams as JobId)
      case 'serverName':
        return this.backupRepository.findByServerName(searchParams as ServerName)
      default:
        return []
    }
  }

  /**
   * BackupInfoRepository 검색 실행
   */
  private async executeBackupInfoRepositorySearch({
    searchType,
    searchParams
  }: {
    searchType: 'jobName' | 'jobId' | 'serverName'
    searchParams: JobName | JobId | ServerName
  }): Promise<BackupInfoTable[]> {
    switch (searchType) {
      case 'jobName':
        return this.backupInfoRepository.findByJobName(searchParams as JobName)
      case 'jobId':
        return this.backupInfoRepository.findByJobId(searchParams as JobId)
      case 'serverName':
        return this.backupInfoRepository.findByServerName(searchParams as ServerName)
      default:
        return []
    }
  }

  /**
   * BackupActiveRepository 검색 실행
   */
  private async executeBackupActiveRepositorySearch({
    searchType,
    searchParams
  }: {
    searchType: 'jobName' | 'jobId' | 'serverName'
    searchParams: JobName | JobId | ServerName
  }): Promise<BackupActiveTable[]> {
    switch (searchType) {
      case 'jobName':
        return this.backupActiveRepository.findByJobName(searchParams as JobName)
      case 'jobId':
        return this.backupActiveRepository.findByJobId(searchParams as JobId)
      case 'serverName':
        return this.backupActiveRepository.findByServerName(searchParams as ServerName)
      default:
        return []
    }
  }

  /**
   * 백업 데이터 조회 및 검증
   */
  private async fetchBackupData({
    identifier,
    searchType,
    filterOptions
  }: {
    identifier: string | number
    searchType: 'jobName' | 'jobId' | 'serverName'
    filterOptions?: BackupMonitoringFilterOptions
  }): Promise<{
    backup: BackupTable | BackupTable[] | null
    backupInfo: BackupInfoTable | BackupInfoTable[] | null
    backupActive: BackupActiveTable | BackupActiveTable[] | null
    logMessages: BackupLogEventTable[]
  }> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "fetchBackupData", state: "start" })

      const searchParams = this.createSearchParams({ identifier, searchType, filterOptions })

      // 병렬로 데이터 조회
      const [backupResults, backupInfoResults, backupActiveResults] = await Promise.all([
        this.executeBackupRepositorySearch({ searchType, searchParams }),
        this.executeBackupInfoRepositorySearch({ searchType, searchParams }),
        this.executeBackupActiveRepositorySearch({ searchType, searchParams })
      ])

      const backup = searchType === 'serverName' ? backupResults : backupResults?.[0] || null
      const backupInfo = searchType === 'serverName' ? backupInfoResults : backupInfoResults?.[0] || null
      const backupActive = searchType === 'serverName' ? backupActiveResults : backupActiveResults?.[0] || null

      // 로그 데이터 조회 (backup이 존재할 때만)
      let logMessages: BackupLogEventTable[] = []
      if (!(searchType === 'serverName')) {
        logMessages = backup && !Array.isArray(backup)
          ? await this.backupLogRepository.getByEventType({ eventType: backup.nID }) ?? []
          : []
      }

      asyncContextStorage.addOrder({
        component: this.serviceName,
        method: "fetchBackupData",
        state: "end"
      })

      return { backup, backupInfo, backupActive, logMessages }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "fetchBackupData",
        message: "[Backup 데이터 조회] - Backup Data 취합 중 에러 발생",
      })
    }
  }

  /**
   * 파티션별 최신 백업 찾기
   */
  private findLatestBackupForPartition({
    partition,
    backupInfoList,
    backupList
  }: {
    partition: string
    backupInfoList: BackupInfoTable[]
    backupList: BackupTable[]
  }): { latestBackup: BackupTable | null, latestBackupInfo: BackupInfoTable | null } {
    // 현재 파티션에 해당하는 backupInfo 필터링
    const partitionBackupInfos = backupInfoList.filter(info => info.sDrive === partition)

    if (partitionBackupInfos.length === 0) {
      return { latestBackup: null, latestBackupInfo: null }
    }

    let latestBackup: BackupTable | null = null
    let latestBackupInfo: BackupInfoTable | null = null

    for (const backupInfo of partitionBackupInfos) {
      // 동일한 JobName을 가진 backup 객체들 찾기
      const jobBackups = backupList.filter(backup => backup.sJobName === backupInfo.sJobName)

      if (jobBackups.length > 0) {
        // sStartTime 기준으로 가장 최신 backup 찾기
        const sortedBackups = jobBackups.sort((a, b) => {
          const timeA = new Date(a.sStartTime || '').getTime()
          const timeB = new Date(b.sStartTime || '').getTime()
          return timeB - timeA // 내림차순 정렬 (최신이 먼저)
        })

        const currentLatestBackup = sortedBackups[0]

        // 전체 파티션에서 가장 최신인지 비교
        if (!latestBackup ||
          new Date(currentLatestBackup.sStartTime || '').getTime() >
          new Date(latestBackup.sStartTime || '').getTime()) {
          latestBackup = currentLatestBackup
          latestBackupInfo = backupInfo
        }
      }
    }

    return { latestBackup, latestBackupInfo }
  }

  /**
   * 파티션별 추가 데이터 조회 (BackupActive, LogMessages)
   */
  private async fetchAdditionalDataForPartition({
    latestBackup
  }: {
    latestBackup: BackupTable
  }): Promise<{ backupActive: BackupActiveTable | null, logMessages: BackupLogEventTable[] }> {
    try {
      const [backupActiveResults, logResults] = await Promise.all([
        this.backupActiveRepository.findByJobName({
          jobName: latestBackup.sJobName,
          filterOptions: {}
        }),
        this.backupLogRepository.getByEventType({ eventType: latestBackup.nID })
      ])

      return {
        backupActive: backupActiveResults?.[0] || null,
        logMessages: logResults || []
      }
    } catch (error) {
      console.warn(`Failed to fetch additional data for job ${latestBackup.sJobName}:`, error)
      return {
        backupActive: null,
        logMessages: []
      }
    }
  }

  /**
   * 결과 확인 및 출력 결과 가공
   */
  private processResult({
    backup,
    backupInfo,
    backupActive,
    logMessages
  }: {
    backup: BackupTable | null
    backupInfo: BackupInfoTable | null
    backupActive: BackupActiveTable | null
    logMessages: BackupLogEventTable[]
  }): BackupDataMonitoringResponse {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processResult", state: "start" })

      if (!backup || !backupInfo) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "processResult",
          message: "[Backup 모니터링 정보 가공] - 작업 정보 일치하지 않음",
        })
      }

      const processedLogs = this.processLogMessages({ logMessages })
      const returnObject = this.createBackupResponse({
        backup,
        backupInfo,
        backupActive,
        processedLogs
      })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "processResult", state: "end" })
      return returnObject
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "processResult",
        message: `[Backup 모니터링] - 출력데이터 생성 실패`,
      })
    }
  }

  /**
   * 파티션별 백업 매핑 처리
   */
  private async processPartitionBackupMapping({
    partitionMap,
    backupInfoList,
    backupList
  }: {
    partitionMap: string[]
    backupInfoList: BackupInfoTable[]
    backupList: BackupTable[]
  }): Promise<PartitionBackupMapping[]> {
    try {
      const partitionBackupMappings: PartitionBackupMapping[] = []

      for (const partition of partitionMap) {
        const { latestBackup, latestBackupInfo } = this.findLatestBackupForPartition({
          partition,
          backupInfoList,
          backupList
        })

        if (!latestBackup || !latestBackupInfo) {
          partitionBackupMappings.push({
            partition,
            backup: null,
            backupInfo: null,
            backupActive: null,
            logMessages: []
          })
          continue
        }

        const { backupActive, logMessages } = await this.fetchAdditionalDataForPartition({ latestBackup })

        partitionBackupMappings.push({
          partition,
          backup: latestBackup,
          backupInfo: latestBackupInfo,
          backupActive,
          logMessages
        })
      }

      return partitionBackupMappings
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "processPartitionBackupMapping",
        message: "[파티션 백업 매핑 처리] - 파티션별 백업 매핑 처리 중 오류 발생",
      })
    }
  }

  /**
   * 파티션별 결과를 BackupDataMonitoringResponse로 변환
   */
  private convertPartitionMappingToResponse({
    partitionMapping,
    serverName
  }: {
    partitionMapping: PartitionBackupMapping
    serverName: string
  }): BackupDataMonitoringResponse | null {
    const { partition, backup, backupInfo, backupActive, logMessages } = partitionMapping

    if (!backup || !backupInfo) {
      // return this.createEmptyBackupResponse({ serverName, partition })
      return null
    }

    const processedLogs = this.processLogMessages({ logMessages })
    return this.createBackupResponse({
      backup,
      backupInfo,
      backupActive,
      processedLogs
    })
  }

  /**
   * Backup 작업 이름으로 모니터링
   */
  async monitByJobName({
    jobName,
    filterOptions
  }: {
    jobName: string
    filterOptions: BackupMonitoringFilterOptions
  }): Promise<BackupDataMonitoringResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "monitByJobName", state: "start" })

      const { backup, backupInfo, backupActive, logMessages } = await this.fetchBackupData({
        identifier: jobName,
        searchType: 'jobName',
        filterOptions
      })

      const result = this.processResult({
        backup: backup as BackupTable,
        backupInfo: backupInfo as BackupInfoTable,
        backupActive: backupActive as BackupActiveTable,
        logMessages
      })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "monitByJobName", state: "end" })

      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "monitByJobName",
        message: `[Backup 작업 이름으로 모니터링] - 예기치 못한 오류 발생`,
      })
    }
  }

  /**
   * Backup 작업 ID로 모니터링
   */
  async monitByJobId({
    jobId,
    filterOptions
  }: {
    jobId: number
    filterOptions: BackupMonitoringFilterOptions
  }): Promise<BackupDataMonitoringResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "monitByJobId", state: "start" })

      const { backup, backupInfo, backupActive, logMessages } = await this.fetchBackupData({
        identifier: jobId,
        searchType: 'jobId',
        filterOptions
      })

      const result = this.processResult({
        backup: backup as BackupTable,
        backupInfo: backupInfo as BackupInfoTable,
        backupActive: backupActive as BackupActiveTable,
        logMessages
      })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "monitByJobId", state: "end" })

      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "monitByJobId",
        message: `[Backup 작업 ID로 모니터링] - 예기치 못한 오류 발생`,
      })
    }
  }

  /**
   * Backup 작업 대상 서버 이름으로 모니터링 (파티션별)
   */
  async monitByServerName({
    serverName,
    filterOptions
  }: {
    serverName: string
    filterOptions?: BackupMonitoringFilterOptions
  }): Promise<BackupDataMonitoringResponse[]> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "monitByServerName", state: "start" })

      // 1. 서버의 파티션 정보와 백업 데이터 병렬 조회
      const [partitionsResult, backupDataResult] = await Promise.all([
        this.serverPartitionService.getPartitionListByServerName({ name: serverName }),
        this.fetchBackupData({
          identifier: serverName,
          searchType: 'serverName',
          filterOptions
        })
      ])

      // 필터 옵션에서 파티션 정보 추출
      let targetPartitions: string[] = []
      if (filterOptions?.partition) {
        targetPartitions = filterOptions.partition.trim().split(',').map(el => el.trim()).filter(el => el)
      }

      // 2. 파티션별 유니크한 드라이브 레터 추출
      let partitionMap = [...new Set(partitionsResult.items.map((el: ServerPartitionTable) => el.sLetter))]

      // 필터 옵션이 있는 경우 해당 파티션들만 포함
      if (targetPartitions.length > 0) {
        partitionMap = partitionMap.filter(partition => targetPartitions.includes(partition))
        ContextLogger.debug({ message: `[monitByServerName] 파티션 필터링 적용 - 대상 파티션: [${targetPartitions.join(', ')}], 필터링된 파티션: [${partitionMap.join(', ')}]` })
      }

      // 3. 백업 데이터 추출
      const backupList = backupDataResult.backup as BackupTable[] || []
      const backupInfoList = backupDataResult.backupInfo as BackupInfoTable[] || []

      // 4. 파티션별 백업 매핑 처리
      const partitionBackupMappings = await this.processPartitionBackupMapping({
        partitionMap,
        backupInfoList,
        backupList
      })

      // 5. 각 파티션 매핑을 BackupDataMonitoringResponse로 변환
      const results = partitionBackupMappings.map(mapping =>
        this.convertPartitionMappingToResponse({
          partitionMapping: mapping,
          serverName
        })
      ).filter(result => result !== null) as BackupDataMonitoringResponse[]

      asyncContextStorage.addOrder({ component: this.serviceName, method: "monitByServerName", state: "end" })

      return results
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "monitByServerName",
        message: `[Backup 서버 이름으로 모니터링] - 예기치 못한 오류 발생`,
      })
    }
  }
}