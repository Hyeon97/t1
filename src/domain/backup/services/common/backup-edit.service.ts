import { ServiceError } from "../../../../errors"
import { CompressionTypeMap } from "../../../../types/common/compression"
import { JobStatusMap } from "../../../../types/common/job"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseService } from "../../../../utils/base/base-service"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { regNfsPath, regSmbPath } from "../../../../utils/regex.utils"
import { ZdmRepositoryGetService } from "../../../zdm/services/repository/zdm.repository-get.service"
import { ZdmGetService } from "../../../zdm/services/common/zdm-get.service"
import { BackupHistoryRepository } from "../../repositories/backup-history.repository"
import { BackupInfoRepository } from "../../repositories/backup-info.repository"
import { BackupLogRepository } from "../../repositories/backup-log-event.repository"
import { BackupRepository } from "../../repositories/backup.repository"
import { BackupTypeMap } from "../../types/backup-common.type"
import { BackupEditRequestBody } from "../../types/backup-edit.type"
import { BackupDataEditResponse } from "../../types/backup-response.type"
import { BackupTable } from "../../types/db/job-backup"
import { BackupInfoTable } from "../../types/db/job-backup-info"
import { EncryptionTypeMap } from "../../../../types/common/encryption"
import { RepositoryConnectionTypeMap } from "../../../../types/common/repository"

export class BackupEditService extends BaseService {
  private readonly zdmGetService: ZdmGetService
  private readonly zdmRepositoryGetService: ZdmRepositoryGetService
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository
  private readonly backupLogRepository: BackupLogRepository
  private readonly backupHistoryRepository: BackupHistoryRepository

  constructor({
    zdmGetService,
    zdmRepositoryGetService,
    backupRepository,
    backupInfoRepository,
    backupLogRepository,
    backupHistoryRepository,
  }: {
    zdmGetService: ZdmGetService
    zdmRepositoryGetService: ZdmRepositoryGetService
    backupRepository: BackupRepository
    backupInfoRepository: BackupInfoRepository
    backupLogRepository: BackupLogRepository
    backupHistoryRepository: BackupHistoryRepository
  }) {
    super({
      serviceName: "BackupEditService",
    })
    this.zdmGetService = zdmGetService
    this.zdmRepositoryGetService = zdmRepositoryGetService
    this.backupRepository = backupRepository
    this.backupInfoRepository = backupInfoRepository
    this.backupLogRepository = backupLogRepository
    this.backupHistoryRepository = backupHistoryRepository
  }

  /**
   * Backup, Backup info 정보 가져오기
   */
  private async getBackupDataSet({ type, value }: { type: "id" | "name"; value: number | string }): Promise<{
    backup: BackupTable
    backupInfo: BackupInfoTable
  }> {
    try {
      let backup = null

      // backup 정보 가져오기 (조건 로직 수정)
      if (type === "name") {
        backup = (await this.backupRepository.findByJobName({ jobName: value as string }))[0] || null
      } else {
        backup = (await this.backupRepository.findByJobId({ jobId: value as number }))[0] || null
      }

      if (!backup) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "getBackupDataSet",
          message: "[Backup 정보 수정] - 일치하는 작업 정보 없음",
        })
      }

      // backup info 정보 가져오기
      const backupInfo = (await this.backupInfoRepository.findByJobName({ jobName: backup.sJobName }))[0] || null
      if (!backupInfo) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "getBackupDataSet",
          message: "[Backup 정보 수정] - 일치하는 작업 추가 정보 없음",
        })
      }

      return { backup, backupInfo }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getBackupDataSet",
        message: "[Backup 정보 수정] - Backup 수정 대상 정보 조회 중 오류 발생",
      })
    }
  }

  /**
   * 작업 이름 변경 가능 여부 확인
   */
  private async isJobNameChangeable({
    backup,
    backupInfo,
    newJobName,
    changedFields,
  }: {
    backup: BackupTable
    backupInfo: BackupInfoTable
    newJobName: string
    changedFields: Set<string>
  }): Promise<void> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "isJobNameChangeable", state: "start" })
      // 변경하려는 작업 이름이 이미 존재하는지 확인
      const existingJobs = await this.backupRepository.findByJobName({ jobName: newJobName })
      if (!existingJobs.length) {
        backup.sJobName = newJobName
        backupInfo.sJobName = newJobName
        changedFields.add("JobName")
      } else {
        ContextLogger.error({
          message: `작업 이름 '${newJobName}'은 이미 사용 중입니다.`,
        })
        throw ServiceError.businessRuleError(ServiceError, {
          method: "isJobNameChangeable",
          message: `[Backup 정보 수정] - 작업 이름 '${newJobName}'은(는) 이미 사용 중입니다.`,
          application: "isJobNameChangeable",
          metadata: { data: { requestedName: newJobName } },
        })
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "isJobNameChangeable", state: "end" })
    } catch (error) {
      if (!(error instanceof ServiceError)) {
        const originError = error
        error = ServiceError.dataProcessingError({
          method: "isJobNameChangeable",
          message: "[Backup 정보 수정] - 작업 이름 변경 중 예기치 못한 오류 발생",
          error: originError,
        })
      }
      this.handleServiceError({
        error,
        method: "isJobNameChangeable",
        message: `[Backup 정보 수정] - 작업 이름 변경 중 오류 발생`,
      })
    }
  }

  /**
   * 작업 상태 변경
   */
  private changeJobStatus({ backup, changeJobStatus, changedFields }: { backup: BackupTable; changeJobStatus: string; changedFields: Set<string> }) {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "changeJobStatus", state: "start" })

      // 유효값 여부 미들웨어에서 검증 완료
      const statusCode = JobStatusMap.fromString({ str: changeJobStatus })
      if (backup.nJobStatus !== statusCode) {
        backup.nJobStatus = statusCode
        changedFields.add("Job Status")
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "changeJobStatus", state: "end" })
    } catch (error) {
      if (!(error instanceof ServiceError)) {
        const originError = error
        error = ServiceError.dataProcessingError({
          method: "changeJobStatus",
          message: "[Backup 정보 수정] - 작업 상태 변경 중 예기치 못한 오류 발생",
          error: originError,
        })
      }
      this.handleServiceError({
        error,
        method: "changeJobStatus",
        message: `[Backup 정보 수정] - 작업 상태 변경 중 오류 발생`,
      })
    }
  }

  /**
   * 작업 스케줄 변경
   */
  private async processScheduleChange({
    schedule,
    backup,
    changedFields,
  }: {
    schedule: any // 적절한 타입으로 변경 필요
    backup: BackupTable
    changedFields: Set<string>
  }): Promise<void> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processScheduleChange", state: "start" })

      // // 스케줄 처리 로직 구현
      // if (schedule.type !== undefined && backup.nScheduleType !== schedule.type) {
      //   backup.nScheduleType = schedule.type
      //   changedFields.add("Schedule")
      // }

      // if (schedule.value !== undefined && backup.nScheduleValue !== schedule.value) {
      //   backup.nScheduleValue = schedule.value
      //   changedFields.add("Schedule")
      // }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "processScheduleChange", state: "end" })
    } catch (error) {
      if (!(error instanceof ServiceError)) {
        const originError = error
        error = ServiceError.dataProcessingError({
          method: "processScheduleChange",
          message: "[Backup 정보 수정] - 스케줄 변경 중 예기치 못한 오류 발생",
          error: originError,
        })
      }
      this.handleServiceError({
        error,
        method: "processScheduleChange",
        message: `[Backup 정보 수정] - 스케줄 변경 중 오류 발생`,
      })
    }
  }

  /**
   * 작업 모드(타입) 변경
   */
  private changeJobMode({ backupInfo, jobMode, changedFields }: { backupInfo: BackupInfoTable; jobMode: string; changedFields: Set<string> }): void {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "changeJobMode", state: "start" })

      // 유효값 여부 미들웨어에서 검증 완료
      const modeCode = BackupTypeMap.fromString({ str: jobMode })
      if (backupInfo.nBackupType !== modeCode) {
        backupInfo.nBackupType = modeCode
        changedFields.add("Backup Type")
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "changeJobMode", state: "end" })
    } catch (error) {
      if (!(error instanceof ServiceError)) {
        const originError = error
        error = ServiceError.dataProcessingError({
          method: "changeJobMode",
          message: "[Backup 정보 수정] - 작업 모드(타입) 변경 중 예기치 못한 오류 발생",
          error: originError,
        })
      }
      this.handleServiceError({
        error,
        method: "changeJobMode",
        message: `[Backup 정보 수정] - 작업 모드(타입) 변경 중 오류 발생`,
      })
    }
  }

  /**
   * 작업 repository 변경
   */
  private async processRepositoryChange({
    repository,
    backupInfo,
    changedFields,
  }: {
    repository: any // 적절한 타입으로 변경 필요
    backupInfo: BackupInfoTable
    changedFields: Set<string>
  }): Promise<void> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processRepositoryChange", state: "start" })

      // 해당 정보의 repository 정보 조회
      const filterOptions = {
        type: repository?.type || "",
      }
      if (repository.id) {
        const { items } = await this.zdmRepositoryGetService.getRepositoryById({ id: Number(repository.id), filterOptions })
        if (items.length) {
          backupInfo.nRepositoryID = items[0].nID
          backupInfo.nRepositoryType = RepositoryConnectionTypeMap.toEnum({ value: items[0].nType })
          backupInfo.sRepositoryPath = items[0].sRemotePath
          changedFields.add("RepositoryID")
          changedFields.add("RepositoryType")
          changedFields.add("RepositoryPath")
        }
      }
      if (repository.path) {
        //  사용자가 입력한 path에 대한 타입 검증이 필요함
        switch (backupInfo.nRepositoryType) {
          case 1: // SMB
            if (!regSmbPath.test(repository.path)) {
              // SMB 경로 검증 실패 처리
              throw ServiceError.badRequest(ServiceError, {
                method: "processRepositoryChange",
                message: `[Backup 정보 수정] - Repository 경로 에러.(SMB 양식 불일치)`,
                metadata: {},
              })
            }
            break
          case 2: // NFS
            if (!regNfsPath.test(repository.path)) {
              // NFS 경로 검증 실패 처리
              throw ServiceError.badRequest(ServiceError, {
                method: "processRepositoryChange",
                message: `[Backup 정보 수정] - Repository 경로 에러.(NFS 양식 불일치)`,
                metadata: {},
              })
            }
            break
        }
        backupInfo.sRepositoryPath = repository.path
        if (!changedFields.has("RepositoryPath")) {
          changedFields.add("RepositoryPath")
        }
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "processRepositoryChange", state: "end" })
    } catch (error) {
      if (!(error instanceof ServiceError)) {
        const originError = error
        error = ServiceError.dataProcessingError({
          method: "processRepositoryChange",
          message: "[Backup 정보 수정] - Repository 정보 변경 중 예기치 못한 오류 발생",
          error: originError,
        })
      }
      this.handleServiceError({
        error,
        method: "processRepositoryChange",
        message: `[Backup 정보 수정] - Repository 정보 변경 중 오류 발생`,
      })
    }
  }

  /**
   * 작업 기타 옵션 변경
   */
  private processOtherOptions({
    data,
    backupInfo,
    changedFields,
  }: {
    data: BackupEditRequestBody
    backupInfo: BackupInfoTable
    changedFields: Set<string>
  }): void {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "processOtherOptions", state: "start" })

      // 기타 옵션 처리 (rotation, compression, encryption, excludeDir 등)
      if (data.rotation) {
        backupInfo.nRotation = data.rotation
        changedFields.add("Rotation")
      }

      if (data.compression) {
        backupInfo.nCompression = CompressionTypeMap.fromString({ str: data.compression })
        changedFields.add("Compression")
      }

      if (data.encryption) {
        backupInfo.nEncryption = EncryptionTypeMap.fromString({ str: data.encryption })
        changedFields.add("Encryption")
      }

      if (data.excludeDir) {
        backupInfo.sExcludeDir = data.excludeDir.split(",").join("|")
        changedFields.add("ExcludeDir")
      }

      // 필요한 다른 옵션들도 처리

      asyncContextStorage.addOrder({ component: this.serviceName, method: "processOtherOptions", state: "end" })
    } catch (error) {
      if (!(error instanceof ServiceError)) {
        const originError = error
        error = ServiceError.dataProcessingError({
          method: "processOtherOptions",
          message: "[Backup 정보 수정] - 작업 기타 옵션 변경 중 예기치 못한 오류 발생",
          error: originError,
        })
      }
      this.handleServiceError({
        error,
        method: "processOtherOptions",
        message: `[Backup 정보 수정] - 작업 기타 옵션 변경 중 오류 발생`,
      })
    }
  }

  /**
   * 정보 수정
   */
  private async editData({ data, backup, backupInfo }: { data: BackupEditRequestBody; backup: BackupTable; backupInfo: BackupInfoTable }): Promise<{
    editBackup: BackupTable
    editBackupInfo: BackupInfoTable
    changedFields: string[]
  }> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "editData", state: "start" })

      // 변경된 필드를 추적하기 위한 Set
      const changedFields = new Set<string>()

      // 작업 이름 변경
      if (data.changeName) {
        await this.isJobNameChangeable({ backup, backupInfo, newJobName: data.changeName, changedFields })
      }

      // 작업 상태 변경
      if (data.status) {
        this.changeJobStatus({ backup, changeJobStatus: data.status, changedFields })
      }

      // 스케줄 변경
      if (data.schedule) {
        await this.processScheduleChange({ schedule: data.schedule, backup, changedFields })
      }

      // 작업 타입 변경
      if (data.type) {
        this.changeJobMode({ backupInfo, jobMode: data.type, changedFields })
      }

      // Repository 관련 데이터 변경
      if (data.repository) {
        await this.processRepositoryChange({ repository: data.repository, backupInfo, changedFields })
      }

      // 기타 옵션 변경 (rotation, compression, encryption, excludeDir 등)
      this.processOtherOptions({ data, backupInfo, changedFields })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "editData", state: "end" })
      return {
        editBackup: backup,
        editBackupInfo: backupInfo,
        changedFields: Array.from(changedFields),
      }
    } catch (error) {
      this.handleServiceError({
        error,
        method: "editData",
        message: `[Backup 정보 수정] - Backup 정보 수정 중 오류 발생`,
      })
    }
  }

  /**
   * 데이터 업데이트
   */
  private async updateBackupDataSet({ editBackup, editBackupInfo }: { editBackup: BackupTable; editBackupInfo: BackupInfoTable }): Promise<void> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "updateBackupDataSet", state: "start" })
      const result = await this.executeTransaction({
        callback: async (transaction) => {
          // Backup 기본 정보 업데이트
          const backupUpdateResult = await this.backupRepository.updateBackup({
            id: editBackup.nID,
            backupData: editBackup,
            transaction,
          })

          // Backup 추가 정보 업데이트
          const backupInfoUpdateResult = await this.backupInfoRepository.updateBackupInfo({
            id: editBackup.nID,
            backupInfoData: editBackupInfo,
            transaction,
          })

          return {
            backupUpdateResult,
            backupInfoUpdateResult,
          }
        },
      })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "updateBackupDataSet", state: "end" })
    } catch (error) {
      if (!(error instanceof ServiceError)) {
        const originError = error
        error = ServiceError.dataProcessingError({
          method: "updateBackupDataSet",
          message: "[Backup 정보 수정] - 작업 정보 DB 적용 중 예기치 못한 오류 발생",
          error: originError,
        })
      }
      this.handleServiceError({
        error,
        method: "updateBackupDataSet",
        message: `[Backup 정보 수정] - 작업 정보 DB 적용 중 오류 발생`,
      })
    }
  }

  /**
   * Backup 작업 수정 Main
   */
  async edit({ jobId, jobName, data }: { jobId?: number; jobName?: string; data: BackupEditRequestBody }): Promise<BackupDataEditResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "edit", state: "start" })
      ContextLogger.debug({ message: "Backup 작업 수정 시작" })
      ContextLogger.debug({ message: "[input data]", meta: { data } })

      // backup, backup info 정보 가져오기
      const type = jobId ? "id" : "name"
      const value = (jobId ? jobId : jobName)!

      const { backup, backupInfo } = await this.getBackupDataSet({ type, value })

      // 데이터 수정
      const { editBackup, editBackupInfo, changedFields } = await this.editData({
        data,
        backup: structuredClone(backup),
        backupInfo: structuredClone(backupInfo),
      })

      // 변경된 필드가 없는 경우
      if (changedFields.length === 0) {
        ContextLogger.info({
          message: `Backup 작업 '${editBackup.sJobName}' 수정 요청되었으나 변경된 내용이 없습니다.`,
        })

        return {
          job_name: editBackup.sJobName,
          job_id: String(editBackup.nJobID),
          changedFields: [],
        }
      }

      // 수정된 데이터 저장
      await this.updateBackupDataSet({ editBackup, editBackupInfo })

      // 결과 반환
      const result = {
        job_name: editBackup.sJobName,
        job_id: String(editBackup.nJobID),
        changedFields, // 변경된 필드 목록 추가
      }

      ContextLogger.info({
        message: `Backup 작업 '${editBackup.sJobName}' 수정 완료`,
        meta: {
          jobId: editBackup.nJobID,
          changedFields, // 로그에도 변경된 필드 정보 추가
        },
      })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "edit", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "edit",
        message: `[Backup 정보 수정] - 오류가 발생했습니다`,
      })
    }
  }
}
