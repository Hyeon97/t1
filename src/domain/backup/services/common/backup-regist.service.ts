import { TransactionManager } from "../../../../database/connection"
import { ServiceError } from "../../../../errors/service/service-error"
import { AutoStartType } from "../../../../types/common/job"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseService } from "../../../../utils/base/base-service"
import { jobUtils } from "../../../../utils/job/job.utils"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../../utils/regex.utils"
import { ScheduleBody } from "../../../schedule/dto/body/schedule-rergist-body"
import { ScheduleGetService } from "../../../schedule/services/schedule-get.service"
import { ScheduleRegistService } from "../../../schedule/services/schedule-regist.service"
import { ScheduleVerifiService } from "../../../schedule/services/schedule-verify.service"
import { ScheduleTypeEnum } from "../../../schedule/types/schedule-common.type"
import { ScheduleDetail } from "../../../schedule/types/schedule-regist.type"
import { ServerGetService } from "../../../server/services/server-get.service"
import { ServerPartitionService } from "../../../server/services/server-partition.service"
import { ServerBasicTable } from "../../../server/types/db/server-basic"
import { ServerPartitionTable } from "../../../server/types/db/server-partition"
import { UserService } from "../../../user/services/user.service"
import { ZdmGetService } from "../../../zdm/services/common/zdm-get.service"
import { ZdmRepositoryGetService } from "../../../zdm/services/repository/zdm.repository-get.service"
import { ZdmInfoTable } from "../../../zdm/types/db/center-info"
import { ZdmRepositoryTable } from "../../../zdm/types/db/center-repository"
import { ZdmRepositoryFilterOptions } from "../../../zdm/types/zdm-repository/zdm-repository-filter.type"
import { BackupInfoRepository } from "../../repositories/backup-info.repository"
import { BackupRepository } from "../../repositories/backup.repository"
import { BackupTypeMap } from "../../types/backup-common.type"
import { BackupInfoTableInput, BackupRegistRequestBody, BackupRequestRepository, BackupTableInput } from "../../types/backup-regist.type"
import { BackupDataRegistResponse } from "../../types/backup-response.type"

//  Backup Data 등록 DataSet 배열 Type
interface BackupDataSet {
  backupDataObject: BackupTableInput
  backupInfoDataObject: BackupInfoTableInput
}

//  Backup Data 등록 결과
interface BackupDataRegistResultSet {
  successful: Array<{ dataSet: BackupDataSet }>
  failed: Array<{ dataSet: BackupDataSet; error: Error }>
}

//  Schedule 관련 DataSet 
interface ScheduleDataSet { nScheduleID?: number, nScheduleID_advanced?: number }

export class BackupRegistService extends BaseService {
  private readonly serverGetService: ServerGetService
  private readonly serverPartitionService: ServerPartitionService
  private readonly zdmGetService: ZdmGetService
  private readonly zdmRepositoryGetService: ZdmRepositoryGetService
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository
  private readonly userService: UserService
  private readonly scheduleGetService: ScheduleGetService
  private readonly scheduleRegistService: ScheduleRegistService
  private readonly scheduleVerifiService: ScheduleVerifiService

  constructor({
    serverGetService,
    serverPartitionService,
    zdmGetService,
    zdmRepositoryGetService,
    backupRepository,
    backupInfoRepository,
    scheduleGetService,
    scheduleVerifiService,
    scheduleRegistService,
    userService
  }: {
    serverGetService: ServerGetService
    serverPartitionService: ServerPartitionService
    zdmGetService: ZdmGetService
    zdmRepositoryGetService: ZdmRepositoryGetService
    backupRepository: BackupRepository
    backupInfoRepository: BackupInfoRepository
    scheduleGetService: ScheduleGetService
    scheduleVerifiService: ScheduleVerifiService
    scheduleRegistService: ScheduleRegistService
    userService: UserService
  }) {
    super({
      serviceName: "BackupRegistService",
    })
    this.serverGetService = serverGetService
    this.serverPartitionService = serverPartitionService
    this.zdmGetService = zdmGetService
    this.zdmRepositoryGetService = zdmRepositoryGetService
    this.backupRepository = backupRepository
    this.backupInfoRepository = backupInfoRepository
    this.scheduleGetService = scheduleGetService
    this.scheduleVerifiService = scheduleVerifiService
    this.scheduleRegistService = scheduleRegistService
    this.userService = userService
  }

  /**
   * Backup Object 생성
   */
  private async createBackupObject({
    data,
    server,
    center,
    schedule
  }: {
    data: BackupRegistRequestBody
    server: ServerBasicTable
    center: ZdmInfoTable
    schedule: ScheduleDataSet
  }): Promise<BackupTableInput> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createBackupObject", state: "start" })
      const object = {
        nUserID: (data.user ?? 1) as number,
        nCenterID: center.nID,
        sSystemName: server.sSystemName,
        sJobName: data.jobName || "",
        nJobID: 0,
        nJobStatus: data.autoStart === "use" ? 3 : 2,
        nScheduleID: schedule?.nScheduleID ?? 0,
        nScheduleID_advanced: schedule?.nScheduleID_advanced ?? 0,
        sJobResult: "",
        sDescription: data.description || "",
        sStartTime: "now()",
        sLastUpdateTime: "now()",
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createBackupObject", state: "end" })
      return object
    } catch (error) {
      throw ServiceError.dataProcessingError({
        method: "createBackupObject",
        message: "[Backup 정보 등록] - Backup Object 생성 오류 발생",
        error,
      })
    }
  }

  /**
   * Backup info Object 생성
   */
  private createBackupInfoObject({
    data,
    server,
    partition,
    center,
    repository,
  }: {
    data: BackupRegistRequestBody
    server: ServerBasicTable
    partition: ServerPartitionTable
    center: ZdmInfoTable
    repository: ZdmRepositoryTable
  }): BackupInfoTableInput {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createBackupInfoObject", state: "start" })
      const object = {
        nID: 0,
        nUserID: (data.user ?? 1) as number,
        nCenterID: center.nID,
        sSystemName: server.sSystemName,
        sJobName: data.jobName || "",
        nBackupType: BackupTypeMap.fromString({ str: data.type }),
        nRotation: data.rotation ?? 1,
        nCompression: data.compression === "use" ? 1 : 0,
        nEncryption: data.encryption === "use" ? 1 : 0,
        sDrive: partition.sLetter,
        sExcludeDir: data.excludeDir as string, //  추후 수정 필요
        nEmailEvent: 0,
        sComment: "",
        nRepositoryID: repository.nID,
        nRepositoryType: repository.nType,
        sRepositoryPath: repository.sRemotePath,
        nNetworkLimit: data.networkLimit ?? 0,
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "createBackupInfoObject", state: "end" })
      return object
    } catch (error) {
      throw ServiceError.dataProcessingError({
        method: "createBackupInfoObject",
        message: "[Backup 정보 등록] - Backup Info Object 생성 오류 발생",
        error,
      })
    }
  }

  /**
   *  서버 정보 가져오기
   */
  private async getServerInfo({ server }: { server: number | string }): Promise<ServerBasicTable> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerInfo", state: "start" })
      let serverInfo = null
      if (typeof server === "number") {
        serverInfo = await this.serverGetService.getServerById({ id: String(server), filterOptions: {} })
      } else if (typeof server === "string") {
        serverInfo = await this.serverGetService.getServerByName({ name: server, filterOptions: {} })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerInfo", state: "end" })
      return serverInfo?.server!
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getServerInfo",
        message: "[Backup 정보 등록] - Server 정보 조회 오류 발생",
      })
    }
  }

  /**
   * 서버 파티션 목록 가져오기
   */
  private async getServerPartitionList({ server }: { server: string }): Promise<ServerPartitionTable[]> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerPartitionList", state: "start" })
      const partitionList = await this.serverPartitionService.getPartitionListByServerName({ name: server })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getServerPartitionList", state: "end" })
      return partitionList?.items!
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getServerPartitionList",
        message: "[Backup 정보 등록] - Server Partition 정보 조회 오류 발생",
      })
    }
  }

  /**
   * center 정보 가져오기
   */
  private async getCenterInfo({ center }: { center: number | string }): Promise<ZdmInfoTable> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getCenterInfo", state: "start" })
      let centerInfo = null
      if (typeof center === "number") {
        centerInfo = await this.zdmGetService.getZdmById({ id: String(center), filterOptions: {} })
      } else if (typeof center === "string") {
        centerInfo = await this.zdmGetService.getZdmByName({ name: center, filterOptions: {} })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getCenterInfo", state: "end" })
      return centerInfo?.zdm!
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getCenterInfo",
        message: "[Backup 정보 등록] - ZDM 정보 조회 오류 발생",
      })
    }
  }

  /**
   * repository 정보 가져오기
   */
  private async getRepositoryInfo({ repository, center }: { repository: BackupRequestRepository; center: ZdmInfoTable }) {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getRepositoryInfo", state: "start" })
      const filterOptions: ZdmRepositoryFilterOptions = {
        center: String(center.nID),
        type: repository.type || "",
        path: repository.path || "",
      }
      const repositoryInfo = await this.zdmRepositoryGetService.getRepositoryById({ id: repository.id, filterOptions })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getRepositoryInfo", state: "end" })
      return repositoryInfo.items[0]
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getRepositoryInfo",
        message: "[Backup 정보 등록] - ZDM Repository 정보 조회 오류 발생",
      })
    }
  }

  /**
   * user 정보 가져오기
   */
  private async getUserIdx({ user }: { user: string }): Promise<string> {
    try {
      if (regNumberOnly.test(user)) {
        return user
      }
      else {
        return String((await this.userService.getUserByEmail({ email: user })).idx)
      }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getUserIdx",
        message: "[Backup 정보 등록] - User 정보 조회 오류 발생",
      })
    }
  }

  /**
   * ID 문자열 여부 확인 (숫자로만 구성된 문자열인지 확인)
   */
  private isIdString({ value }: { value: any }): boolean {
    return typeof value === 'string' && regNumberOnly.test(value)
  }

  /**
   * 스케줄용 상세 body 생성
   */
  private async getScheduleDetailById({ scheduleId }: { scheduleId: number }): Promise<{
    scheduleDetail: ScheduleDetail; type: number
  } | null> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getScheduleDetailById", state: "start" })
      let body = null
      const data = await this.scheduleGetService.getSchedulesById({ id: scheduleId })
      if (data) {
        body = {
          type: data.schedule.nScheduleType,
          scheduleDetail: {
            year: data.schedule.sYear || '',
            month: data.schedule.sMonth || data.schedule.sMonths || '',
            week: data.schedule.sWeek || '',
            day: data.schedule.sDay || data.schedule.sDayweek || data.schedule.sDate || '',
            time: data.schedule.sTime!,
            interval: {
              hour: String(data.schedule.nPeriodHour) || '',
              minute: String(data.schedule.nPeriodMinute) || ''
            }
          }
        }
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getScheduleDetailById", state: "end" })
      return body
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getScheduleDetailById",
        message: "[Backup 정보 등록] - Schedule 정보 등록/검증 오류 발생",
      })
    }
  }

  /**
   * Smart 스케줄 ID로 조회 및 검증
   */
  private async processSmartScheduleWithIds({ fullId, incrementId }: {
    fullId: string,
    incrementId: string
  }): Promise<ScheduleDataSet> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processSmartScheduleWithIds", state: "start" })
      // Full 스케줄 조회
      const _f = await this.getScheduleDetailById({ scheduleId: Number(fullId) })
      if (!_f) {
        throw ServiceError.badRequest(ServiceError, {
          method: "processSmartScheduleWithIds",
          message: `[Backup 정보 등록] - 스케줄 ID(${fullId})를 찾을 수 없습니다.`,
        })
      }

      // Increment 스케줄 조회
      const _i = await this.getScheduleDetailById({ scheduleId: Number(incrementId) })
      if (!_i) {
        throw ServiceError.badRequest(ServiceError, {
          method: "processSmartScheduleWithIds",
          message: `[Backup 정보 등록] - 스케줄 ID(${incrementId})를 찾을 수 없습니다.`,
        })
      }

      // 1. 타입 검증
      if (_f.type !== _i.type) {
        throw ServiceError.badRequest(ServiceError, {
          method: "processSmartScheduleWithIds",
          message: `[Backup 정보 등록] - Smart 스케줄 타입 불일치: full(${_f!.type})과 increment(${_i?.type}) 스케줄은 같은 타입이어야 합니다.`,
        })
      }

      // 2. 타입 검증 완료 후 타입이 똑같다는 전제 하 타입 2차검증 (7 ~ 11) 사이인지 확인
      if (_f.type < ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY) {
        throw ServiceError.badRequest(ServiceError, {
          method: "processSmartScheduleWithIds",
          message: `[Backup 정보 등록] - 해당 스케쥴은 Smart Schedule이 아닙니다.`,
        })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processSmartScheduleWithIds", state: "end" })
      return {
        nScheduleID: Number(fullId),
        nScheduleID_advanced: Number(incrementId)
      }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "processSmartScheduleWithIds",
        message: "[Backup 정보 등록] - Schedule 정보 등록/검증 오류 발생",
      })
    }
  }

  /**
   * Smart 스케줄 객체로 등록
   */
  private async processSmartScheduleWithObjects({
    fullObj, incrementObj, type, center, user
  }: {
    fullObj: ScheduleDetail,
    incrementObj: ScheduleDetail,
    type: number,
    center: ZdmInfoTable,
    user: string
  }): Promise<ScheduleDataSet> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processSmartScheduleWithObjects", state: "start" })
      if (type === undefined || type === null || type < ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY) {
        throw ServiceError.badRequest(ServiceError, {
          method: "processSmartScheduleWithIds",
          message: `[Backup 정보 등록] - Smart Schedule인 경우 Type은 7 ~ 11 만 가능합니다.`,
        })
      }

      // 검증
      const scheduleData = { full: fullObj, increment: incrementObj }
      await this.scheduleVerifiService.validateSchedule({ scheduleData, type })

      // 검증 통과시 DB 등록
      // DB 등록 DataSet
      const data = {
        center: String(center.nID),
        type,
        user,
        full: fullObj,
        increment: incrementObj,
      }
      //  DB 등록
      const registResult = await this.scheduleRegistService.regist({ data })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processSmartScheduleWithObjects", state: "end" })
      return {
        nScheduleID: registResult.scheduleID,
        nScheduleID_advanced: registResult.scheduleID_advanced
      }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "processSmartScheduleWithObjects",
        message: "[Backup 정보 등록] - Schedule 정보 등록/검증 오류 발생",
      })
    }
  }

  /**
   * Full 또는 Increment 스케줄 ID로 조회
   */
  private async processSingleScheduleWithId({
    scheduleId
  }: {
    scheduleId: string
  }): Promise<ScheduleDataSet> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processSingleScheduleWithId", state: "start" })
      const scheduleDetail = await this.getScheduleDetailById({ scheduleId: Number(scheduleId) })
      if (!scheduleDetail) {
        throw ServiceError.badRequest(ServiceError, {
          method: "processSmartScheduleWithIds",
          message: `[Backup 정보 등록] - 스케줄 ID(${scheduleId})를 찾을 수 없습니다.`,
        })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processSingleScheduleWithId", state: "end" })

      return { nScheduleID: Number(scheduleId) }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "processSingleScheduleWithId",
        message: "[Backup 정보 등록] - Schedule 정보 등록/검증 오류 발생",
      })
    }
  }

  /**
   * Full 또는 Increment 스케줄 객체로 등록
   */
  private async processSingleScheduleWithObject({
    scheduleObj, type, center, user, isFullSchedule
  }: {
    scheduleObj: ScheduleDetail,
    type: number,
    center: ZdmInfoTable,
    user: string,
    isFullSchedule: boolean
  }): Promise<ScheduleDataSet> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processSingleScheduleWithObject", state: "start" })
      if (type === undefined || type === null || type >= ScheduleTypeEnum.SMART_WEEKLY_ON_SPECIFIC_DAY) {
        throw ServiceError.badRequest(ServiceError, {
          method: "processSmartScheduleWithIds",
          message: `[Backup 정보 등록] - Full/Increment Schedule인 경우 Type은 0 ~ 6 만 가능합니다.`,
        })
      }

      // 검증
      const scheduleData = isFullSchedule
        ? { full: scheduleObj }
        : { increment: scheduleObj }

      await this.scheduleVerifiService.validateSchedule({ scheduleData, type })

      // 검증 통과시 DB 등록
      const data = {
        center: String(center.nID),
        type,
        user,
        ...scheduleData
      }

      const registResult = await this.scheduleRegistService.regist({ data })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processSingleScheduleWithObject", state: "end" })
      return { nScheduleID: registResult.scheduleID }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "processSingleScheduleWithObject",
        message: "[Backup 정보 등록] - Schedule 정보 등록/검증 오류 발생",
      })
    }
  }

  /**
   * schedule 정보 검증 or 가져오기
   * 사용자가 작업을 등록하면서 신규로 스케쥴을 등록하는 경우도 고려
   * 입력은 숫자 - 숫자 or 신규 - 신규 만 가능 || 숫자 - 신규 \ 신규 - 숫자는 불가능
   */
  private async setScheduleInfo({ schedule, center, user }: {
    schedule?: ScheduleBody, center: ZdmInfoTable, user: string
  }): Promise<ScheduleDataSet> {
    try {
      // 기본 값
      const defaultResult: ScheduleDataSet = { nScheduleID: 0, nScheduleID_advanced: 0 }
      if (!schedule) return defaultResult

      asyncContextStorage.addOrder({ component: this.serviceName, method: "setScheduleInfo", state: "start" })

      let result: ScheduleDataSet
      //  smart 스케쥴
      if (schedule?.full && schedule?.increment) {
        //  1. ID:ID - 기존 등록 불러오기 >> 별도의 추가 검증 필요 없음. ( 기초검증 schedule type, full schedule 확인 )
        if (this.isIdString({ value: schedule.full }) && this.isIdString({ value: schedule.increment })) {
          result = await this.processSmartScheduleWithIds({
            fullId: schedule.full as string,
            incrementId: schedule.increment as string
          })
        }
        //  2. 객체:객체 - 신규 등록
        else if (typeof schedule.full === 'object' && typeof schedule.increment === 'object') {
          result = await this.processSmartScheduleWithObjects({
            fullObj: schedule.full as ScheduleDetail,
            incrementObj: schedule.increment as ScheduleDetail,
            type: schedule.type!,
            center,
            user
          })
        }
        //  그외 - 불가능
        else {
          throw ServiceError.badRequest(ServiceError, {
            method: "processSmartScheduleWithIds",
            message: `[Backup 정보 등록] - 스케쥴 등록은 ID:ID 또는 객체:객체 형식만 가능합니다.`,
          })
        }
      }
      //  full 스케쥴
      else if (schedule?.full) {
        //  ID - 기존 등록 불러오기
        if (this.isIdString({ value: schedule.full })) {
          result = await this.processSingleScheduleWithId({
            scheduleId: schedule.full as string
          })
        }
        //  객체 - 신규 등록
        else {
          result = await this.processSingleScheduleWithObject({
            scheduleObj: schedule.full as ScheduleDetail,
            type: schedule.type!,
            center,
            user,
            isFullSchedule: true
          })
        }
      }
      //  increment 스케쥴 
      else if (schedule?.increment) {
        //  ID - 기존 등록 불러오기
        if (this.isIdString({ value: schedule.increment })) {
          result = await this.processSingleScheduleWithId({
            scheduleId: schedule.increment as string
          })
        }
        //  객체 - 신규 등록
        else {
          result = await this.processSingleScheduleWithObject({
            scheduleObj: schedule.increment as ScheduleDetail,
            type: schedule.type!,
            center,
            user,
            isFullSchedule: true
          })
        }
      }
      // 어떤 스케줄 타입도 제공되지 않은 경우
      else {
        result = defaultResult
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "setScheduleInfo", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "setScheduleInfo",
        message: "[Backup 정보 등록] - Schedule 정보 등록/검증 오류 발생",
      })
    }
  }

  /**
   * 데이터 전처리(제외 파티션)
   */
  private preprocessExcludePartitions({ excludePartition }: { excludePartition: string }): string[] {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "preprocessExcludePartitions", state: "start" })
      // 문자열을 '|'로 분리
      const partitions = excludePartition.split("|")

      // 빈 문자열 항목 제거 및 트림 처리
      const validPartitions = partitions.map((partition) => partition.trim()).filter((partition) => partition.length > 0)
      asyncContextStorage.addOrder({ component: this.serviceName, method: "preprocessExcludePartitions", state: "end" })
      return validPartitions
    } catch (error) {
      throw ServiceError.dataProcessingError({
        method: "preprocessExcludePartitions",
        message: "[Backup 정보 등록] - Exclude Partition 정보 가공 오류 발생",
        error,
      })
    }
  }

  /**
   * 데이터 전처리(작업제외 디렉토리)
   */
  private preprocessExcludeDir({ excludeDir }: { excludeDir: string }): string[] {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "preprocessExcludeDir", state: "start" })
      // 문자열을 '|'로 분리
      const dirs = excludeDir.split("|")

      // 빈 문자열 항목 제거 및 트림 처리
      const validPartitions = dirs.map((dir) => dir.trim()).filter((dir) => dir.length > 0)
      asyncContextStorage.addOrder({ component: this.serviceName, method: "preprocessExcludeDir", state: "end" })
      return validPartitions
    } catch (error) {
      throw ServiceError.dataProcessingError({
        method: "preprocessExcludeDir",
        message: "[Backup 정보 등록] - Exclude Dir 정보 가공 오류 발생",
        error,
      })
    }
  }

  /**
   * Backup 데이터 세트 DB 등록
   */
  private async registerBackupDataSet({ dataSet, transaction }: { dataSet: BackupDataSet; transaction: TransactionManager }): Promise<BackupDataSet> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "registerBackupDataSet", state: "start" })
      // 1. Backup 기본 정보 등록
      const backupRegistResult = await this.backupRepository.insertBackup({
        backupData: dataSet.backupDataObject,
        transaction,
      })

      // 2. Backup 객체 nJobID 설정
      dataSet.backupDataObject.nJobID = backupRegistResult.insertId

      // 3. Backup 객체 업데이트
      const { sStartTime, sLastUpdateTime, ...backupDataWithoutTimeFields } = dataSet.backupDataObject
      await this.backupRepository.updateBackup({
        id: backupRegistResult.insertId,
        transaction,
        backupData: backupDataWithoutTimeFields,
      })

      // 4. Backup info 객체에 ID 설정
      dataSet.backupInfoDataObject.nID = backupRegistResult.insertId

      // 5. Backup info 정보 등록
      const backupInfoRegistResult = await this.backupInfoRepository.insertBackupInfo({
        backupInfoData: dataSet.backupInfoDataObject,
        transaction,
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "registerBackupDataSet", state: "end" })
      return dataSet
    } catch (error) {
      throw ServiceError.dataProcessingError({
        method: "registerBackupDataSet",
        message: "[Backup 정보 등록] - Backup / Backup Info 정보 DB등록 중 오류 발생",
        error,
      })
    }
  }

  /**
   * 여러 Backup 데이터 세트 병렬 등록
   */
  private async registerAllBackupDataSets({ dataSets }: { dataSets: BackupDataSet[] }): Promise<BackupDataRegistResultSet> {
    asyncContextStorage.addOrder({ component: this.serviceName, method: "registerAllBackupDataSets", state: "start" })
    const results = await Promise.allSettled(
      dataSets.map((dataSet) =>
        this.executeTransaction({
          callback: async (transaction) => {
            return this.registerBackupDataSet({
              dataSet,
              transaction,
            })
          },
        })
      )
    )

    const successful: Array<{ dataSet: BackupDataSet }> = []
    const failed: Array<{ dataSet: BackupDataSet; error: Error }> = []

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successful.push({ dataSet: dataSets[index] })
      } else {
        failed.push({
          dataSet: dataSets[index],
          error: result.reason,
        })
      }
    })
    asyncContextStorage.addOrder({ component: this.serviceName, method: "registerAllBackupDataSets", state: "end" })
    return { successful, failed }
  }

  /**
   * 결과 확인 및 출력 결과 가공
   */
  private processResult({ data, autoStart }: { data: BackupDataRegistResultSet; autoStart: AutoStartType }): BackupDataRegistResponse {
    asyncContextStorage.addOrder({ component: this.serviceName, method: "processResult", state: "start" })
    const returnObject: any[] = []
    //  스케쥴 사용 여부
    const useSchedule = ({ data }: { data: BackupTableInput }) => {
      if (data.nScheduleID && data.nScheduleID_advanced) {
        return "Smart Schedule"
      } else if (data.nScheduleID && !data.nScheduleID_advanced) {
        return "Increment Schedule"
      } else if (!data.nScheduleID && data.nScheduleID_advanced) {
        return "Full Schedule"
      } else return "-"
    }
    //  성공한 작업
    data.successful.forEach((el) => {
      const d = el.dataSet
      returnObject.push({
        state: "success",
        job_name: d.backupDataObject.sJobName,
        partition: d.backupInfoDataObject.sDrive,
        job_type: BackupTypeMap.toString({ value: d.backupInfoDataObject.nBackupType }),
        auto_start: autoStart,
        use_schedule: useSchedule({ data: d.backupDataObject }),
      })
    })

    //  실패한 작업
    data.failed.forEach((el) => {
      const d = el.dataSet
      returnObject.push({
        state: "fail",
        job_name: "-",
        partition: d.backupInfoDataObject.sDrive,
        job_type: "-",
        auto_start: "-",
        use_schedule: "-",
      })
    })
    asyncContextStorage.addOrder({ component: this.serviceName, method: "processResult", state: "end" })
    return returnObject
  }

  /**
   *  Backup 작업 등록 Main
   */
  async regist({ data }: { data: BackupRegistRequestBody }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "regist", state: "start" })
      ContextLogger.debug({ message: "Backup 작업 등록 시작", meta: { data } })

      //  server 정보 가져오기
      const server = await this.getServerInfo({ server: data.server })
      //  파티션 정보 가져오기
      const partitionList = await this.getServerPartitionList({ server: server.sSystemName })
      //  center 정보 가져오기
      const center = await this.getCenterInfo({ center: data.center })
      //  repository 정보 가져오기
      const repository = await this.getRepositoryInfo({ repository: data.repository, center })
      //  user 정보 가져오기
      const user = await this.getUserIdx({ user: data.user as string })
      data.user = user
      //  schedule 정보 가져오기
      const schedule = await this.setScheduleInfo({ schedule: data.schedule, center, user })
      //  데이터 전처리(작업제외 파티션)
      if (data.excludePartition) {
        data.excludePartition = this.preprocessExcludePartitions({ excludePartition: data.excludePartition as string })
      }
      //  데이터 전처리(작업제외 디렉토리)
      // if (data.excludeDir) {
      //   data.excludeDir = this.preprocessExcludeDir({ excludeDir: data.excludeDir as string })
      // }
      const dataSet: BackupDataSet[] = []
      // 처리할 파티션 목록 결정
      const partitionsToProcess = data.partition.length
        ? data.partition.map((partition) => {
          const partitionInfo = partitionList.find((item) => item.sLetter === partition)
          //  사용자 입력 파티션 검증
          if (!partitionInfo) {
            throw ServiceError.badRequest(ServiceError, {
              method: "regist",
              message: `[Backup 정보 등록] - 파티션( ${partition} )이 서버( ${server.sSystemName} )에 존재하지 않습니다`,
              metadata: {
                partition,
                server: server.sSystemName,
              },
            })
          }

          return partitionInfo
        })
        : partitionList

      // 제외 파티션이 아닌 것들만 필터링 후 dataSet 생성
      let maxIdx = 0
      await Promise.all(
        partitionsToProcess
          .filter((partition) => !data.excludePartition?.includes(partition.sLetter))
          .map(async (partition: ServerPartitionTable) => {
            // const jobNameResult = await this.preprocessJobName({ jobName: data.jobName || '', server: server, partition: partition.sLetter })
            const jobNameResult = await jobUtils.preprocessJobName({
              jobName: data.jobName || "",
              server: server,
              partition: partition.sLetter,
              type: "Backup",
              repository: this.backupRepository,
            })
            data.jobName = jobNameResult.jName
            maxIdx = Math.max(maxIdx, jobNameResult.idx)
            const backupDataObject = await this.createBackupObject({ data, server, center, schedule })
            const backupInfoDataObject = this.createBackupInfoObject({
              data,
              server,
              partition,
              center,
              repository,
            })
            dataSet.push({ backupDataObject, backupInfoDataObject })
          })
      )

      ContextLogger.info({ message: `총 ${dataSet.length}개의 Backup 작업 등록 dataSet을 생성했습니다.` })

      // 데이터 등록
      if (dataSet.length === 0) {
        throw ServiceError.badRequest(ServiceError, {
          method: "regist",
          message: "[Backup 정보 등록] - 등록할 Backup 작업이 없습니다. 파티션 정보를 확인해주세요.",
        })
      }

      //  dataSet 등록전 작업 이름 최종 수정
      dataSet.map((el) => {
        const sjobName = el.backupDataObject.sJobName.replace("_idx", `_${maxIdx}`)
        el.backupDataObject.sJobName = el.backupInfoDataObject.sJobName = sjobName
      })

      const registrationResult = await this.registerAllBackupDataSets({ dataSets: dataSet })

      ContextLogger.info({
        message: `[Backup 정보 등록] - Backup 작업 등록 완료`,
        meta: {
          totalRequested: dataSet.length,
          successful: registrationResult.successful.length,
          failed: registrationResult.failed.length,
        },
      })

      // 일부 등록이 실패한 경우 경고 로깅
      if (registrationResult.failed.length > 0) {
        ContextLogger.warn({
          message: `[Backup 정보 등록] - 일부 Backup 작업 등록에 실패했습니다`,
          meta: {
            failedCount: registrationResult.failed.length,
            errors: registrationResult.failed.map((f) => ({
              partition: f.dataSet.backupInfoDataObject.sDrive,
              errorMessage: f.error instanceof Error ? f.error.message : String(f.error),
            })),
          },
        })
      }

      // 결과 리턴
      const result = this.processResult({ data: registrationResult, autoStart: data.autoStart! })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "regist", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "regist",
        message: `[Backup 정보 등록] - 오류가 발생했습니다`,
      })
    }
  }
}
