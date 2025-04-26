import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseService } from "../../../../utils/base/base-service"
import { BackupInfoRepository } from "../../repositories/backup-info.repository"
import { BackupRepository } from "../../repositories/backup.repository"
import { BackupFilterOptions } from "../../types/backup-get.type"
import { BackupDataResponse } from "../../types/backup-response.type"
import { BackupTable } from "../../types/db/job-backup"
import { BackupInfoTable } from "../../types/db/job-backup-info"

export class BackupGetService extends BaseService {
  private readonly backupRepository: BackupRepository
  private readonly backupInfoRepository: BackupInfoRepository
  constructor({ backupRepository, backupInfoRepository }: { backupRepository: BackupRepository; backupInfoRepository: BackupInfoRepository }) {
    super({
      serviceName: "BackupGetService",
    })
    this.backupRepository = backupRepository
    this.backupInfoRepository = backupInfoRepository
  }

  /**
   * Backup Info data 조합
   */
  private combineBackupInfoData({ backups, backupInfos }: { backups: BackupTable[]; backupInfos: BackupInfoTable[] }): BackupDataResponse[] {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "combineBackupInfoData", state: "start" })
      const backupMap = new Map<string, Partial<BackupDataResponse>>()
      backups.forEach((backup) => {
        backupMap.set(backup.sJobName, { backup })
      })

      backupInfos.forEach((info) => {
        const backup = backupMap.get(info.sJobName)
        if (backup) {
          backup.info = info
        }
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "combineBackupInfoData", state: "end" })
      return Array.from(backupMap.values()).filter((data): data is BackupDataResponse => !!data.backup && !!data.info)
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "combineBackupInfoData",
        message: "[Backup 데이터 조합] - Backup Data 취합 중 에러 발생",
      })
    }
  }

  /**
   * Backup 정보 먼저 조회
   */
  private async getBackupsByBackupFirst({
    filterOptions,
  }: {
    filterOptions: BackupFilterOptions
  }): Promise<{ backups: BackupTable[]; backupInfos: BackupInfoTable[] }> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getBackupsByBackupFirst", state: "start" })
      // Backup 기본 정보 조회
      const backups = await this.backupRepository.findAll({ filterOptions })

      if (!backups.length) {
        return { backups: [], backupInfos: [] }
      }

      // 조회된 backup의 JobName 목록 추출
      const jobNames = backups.map((backup: BackupTable) => backup.sJobName)

      // backup info 정보 조회
      const backupInfos = await this.backupInfoRepository.findByJobNames({
        jobNames,
        filterOptions,
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getBackupsByBackupFirst", state: "end" })
      return { backups, backupInfos }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getBackupsByBackupFirst",
        message: `[Backup 정보 조회] - 예기치 못한 오류 발생`,
      })
    }
  }

  /**
   * BackupInfo 정보 먼저 조회
   */
  private async getBackupsByInfoFirst({
    filterOptions,
  }: {
    filterOptions: BackupFilterOptions
  }): Promise<{ backups: BackupTable[]; backupInfos: BackupInfoTable[] }> {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getBackupsByInfoFirst", state: "start" })
      // BackupInfo 정보 조회
      const backupInfos = await this.backupInfoRepository.findAll({ filterOptions })

      if (!backupInfos.length) {
        return { backups: [], backupInfos: [] }
      }

      // 조회된 info의 JobName 목록 추출
      const jobNames = backupInfos.map((info: BackupInfoTable) => info.sJobName)

      // backup 정보 조회
      const backups = await this.backupRepository.findByJobNames({
        jobNames,
        filterOptions,
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getBackupsByInfoFirst", state: "end" })
      return { backups, backupInfos }
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getBackupsByInfoFirst",
        message: `[Backup 정보 조회] - 예기치 못한 오류 발생`,
      })
    }
  }

  /**
   * 모든 Backup 작업 조회
   */
  async getBackups({ filterOptions }: { filterOptions: BackupFilterOptions }): Promise<BackupDataResponse[]> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getBackups", state: "start" })

      // 필터 옵션 분리
      const { result, ...infoFilterOptions } = filterOptions

      // 필터 옵션 많은쪽 먼저 조회
      let backups: BackupTable[] = []
      let backupInfos: BackupInfoTable[] = []
      if (Object.keys(infoFilterOptions).length > 0 && !result) {
        // info 테이블 필터링이 있는 경우, 먼저 info 데이터를 조회하고 관련 backup만 가져옴
        const result = await this.getBackupsByInfoFirst({ filterOptions })
        backups = result.backups
        backupInfos = result.backupInfos
      } else {
        // backup 테이블 필터링이 있거나 필터가 없는 경우, 먼저 backup 데이터를 조회
        const result = await this.getBackupsByBackupFirst({ filterOptions })
        backups = result.backups
        backupInfos = result.backupInfos
      }

      // 데이터 조합
      const output = this.combineBackupInfoData({ backups, backupInfos })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "getBackups", state: "end" })
      return output
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getBackups",
        message: `[Backup 정보 조회] - 예기치 못한 오류 발생`,
      })
    }
  }

  // /**
  //  * Backup 작업 이름으로 조회
  //  */
  // async getBackupByName({ name, filterOptions }: { name: string; filterOptions: BackupFilterOptions }): Promise<BackupDataResponse> {
  //   try {
  //     const nameFilter = { ...filterOptions, name }
  //     const { backups, backupInfos } = await this.getBackupsByBackupFirst({
  //       filterOptions: nameFilter,
  //     })

  //     const results = this.combineBackupInfoData({ backups, backupInfos })

  //     if (results.length === 0) {
  //       throw ApiError.notFound({ message: `'${name}' Backup 작업을 찾을 수 없습니다` })
  //     }

  //     return results[0]
  //   } catch (error) {
  //     if (error instanceof ApiError) throw error
  //     throw ApiError.internal({ message: "Backup 작업을 조회하는 중에 예기치 못한 오류 발생" })
  //   }
  // }

  // /**
  //  * Backup 작업 ID로 조회
  //  */
  // async getBackupById({ id, filterOptions }: { id: number; filterOptions: BackupFilterOptions }): Promise<BackupDataResponse> {
  //   try {
  //     const idFilter = { ...filterOptions, id }
  //     const { backups, backupInfos } = await this.getBackupsByBackupFirst({
  //       filterOptions: idFilter,
  //     })

  //     const results = this.combineBackupInfoData({ backups, backupInfos })

  //     if (results.length === 0) {
  //       throw ApiError.notFound({ message: `ID가 '${id}'인 Backup 작업을 찾을 수 없습니다` })
  //     }

  //     return results[0]
  //   } catch (error) {
  //     if (error instanceof ApiError) throw error
  //     throw ApiError.internal({ message: "Backup 작업을 조회하는 중에 예기치 못한 오류 발생" })
  //   }
  // }

  // /**
  //  * Backup 작업 대상 Server 이름으로 조회
  //  */
  // async getBackupsByServerName({
  //   serverName,
  //   filterOptions,
  // }: {
  //   serverName: string
  //   filterOptions: BackupFilterOptions
  // }): Promise<BackupDataResponse[]> {
  //   try {
  //     const serverFilter = { ...filterOptions, serverName }
  //     const { backups, backupInfos } = await this.getBackupsByBackupFirst({
  //       filterOptions: serverFilter,
  //     })

  //     return this.combineBackupInfoData({ backups, backupInfos })
  //   } catch (error) {
  //     if (error instanceof ApiError) throw error
  //     throw ApiError.internal({ message: "Backup 작업을 조회하는 중에 예기치 못한 오류 발생" })
  //   }
  // }
}
