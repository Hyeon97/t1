import { ServiceError } from "../../../../errors/service/service-error"
import { asyncContextStorage } from "../../../../utils/AsyncContext"
import { BaseService } from "../../../../utils/base/base-service"
import { ContextLogger } from "../../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../../utils/regex.utils"
import { ZdmDiskRepository } from "../../repositories/center-info-disk.repository"
import { ZdmNetworkRepository } from "../../repositories/center-info-network.repository"
import { ZdmPartitionRepository } from "../../repositories/center-info-partition.repository"
import { ZdmRepository } from "../../repositories/center-info.repository"
import { ZdmRepositoryRepository } from "../../repositories/center-repository.repository"
import { ZdmZosRepositoryRepository } from "../../repositories/center-zos-repository.repository"
import { ZdmInfoTable } from "../../types/db/center-info"
import { ZdmInfoDiskTable } from "../../types/db/center-info-disk"
import { ZdmInfoNetworkTable } from "../../types/db/center-info-network"
import { ZdmInfoPartitionTable } from "../../types/db/center-info-partition"
import { ZdmRepositoryTable } from "../../types/db/center-repository"
import { ZdmFilterOptions } from "../../types/zdm/zdm-filter.type"
import { ZdmDataResponse } from "../../types/zdm/zdm-response.type"

type AdditionalInfoKey = "disks" | "networks" | "partitions" | "repositories"
type ZdmDataPropertyKey = Exclude<keyof ZdmDataResponse, "zdm">

export class ZdmGetService extends BaseService {
  private readonly zdmRepository: ZdmRepository
  private readonly zdmDiskRepository: ZdmDiskRepository
  private readonly zdmNetworkRepository: ZdmNetworkRepository
  private readonly zdmPartitionRepository: ZdmPartitionRepository
  private readonly zdmRepositoryRepository: ZdmRepositoryRepository
  private readonly zdmZosRepositoryRepository: ZdmZosRepositoryRepository
  constructor({
    zdmRepository,
    zdmDiskRepository,
    zdmNetworkRepository,
    zdmPartitionRepository,
    zdmRepositoryRepository,
    zdmZosRepositoryRepository,
  }: {
    zdmRepository: ZdmRepository
    zdmDiskRepository: ZdmDiskRepository
    zdmNetworkRepository: ZdmNetworkRepository
    zdmPartitionRepository: ZdmPartitionRepository
    zdmRepositoryRepository: ZdmRepositoryRepository
    zdmZosRepositoryRepository: ZdmZosRepositoryRepository
  }) {
    super({
      serviceName: "ZdmGetService",
    })
    this.zdmRepository = zdmRepository
    this.zdmDiskRepository = zdmDiskRepository
    this.zdmNetworkRepository = zdmNetworkRepository
    this.zdmPartitionRepository = zdmPartitionRepository
    this.zdmRepositoryRepository = zdmRepositoryRepository
    this.zdmZosRepositoryRepository = zdmZosRepositoryRepository
  }
  /**
   * ZDM 추가정보 가져오기
   */
  private async getAdditionalInfo({ filterOptions, systemNames = [] }: { filterOptions?: ZdmFilterOptions; systemNames?: string[] }) {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getAdditionalInfo", state: "start" })
      // 시스템 이름이 없거나 빈 배열이면 빈 결과 반환
      if (!systemNames.length) {
        return {
          disks: [] as ZdmInfoDiskTable[],
          networks: [] as ZdmInfoNetworkTable[],
          partitions: [] as ZdmInfoPartitionTable[],
          repositories: [] as ZdmRepositoryTable[],
        }
      }
      // 요청된 데이터만 조회하도록 Promise 배열 구성
      type PromiseResult = { type: AdditionalInfoKey; data: any[] }
      const promises: Array<Promise<PromiseResult>> = []

      interface RepositoryMapping {
        condition: boolean
        type: AdditionalInfoKey
        repository: {
          findBySystemNames: (params: { systemNames: string[] }) => Promise<any[]>
        }
        errorMessage: string
      }

      // 레포지토리 매핑 정의
      const repositoryMappings: RepositoryMapping[] = [
        {
          condition: !!filterOptions?.disk,
          type: "disks",
          repository: this.zdmDiskRepository,
          errorMessage: "디스크 정보 조회 - 오류 발생",
        },
        {
          condition: !!filterOptions?.network,
          type: "networks",
          repository: this.zdmNetworkRepository,
          errorMessage: "네트워크 정보 조회 - 오류 발생",
        },
        {
          condition: !!filterOptions?.partition,
          type: "partitions",
          repository: this.zdmPartitionRepository,
          errorMessage: "파티션 정보 조회 - 오류 발생",
        },
        {
          condition: !!filterOptions?.repository,
          type: "repositories",
          repository: this.zdmRepositoryRepository,
          errorMessage: "레포지토리 정보 조회 - 오류 발생",
        },
      ]

      // 조건에 따라 프로미스 생성
      repositoryMappings.forEach((mapping) => {
        if (mapping.condition) {
          promises.push(
            mapping.repository
              .findBySystemNames({ systemNames })
              .then((result) => ({ type: mapping.type, data: result }))
              .catch((error) => {
                ContextLogger.warn({
                  message: mapping.errorMessage,
                  meta: { error: error instanceof Error ? error.message : String(error) },
                })
                return { type: mapping.type, data: [] }
              })
          )
        }
      })

      // Promise.allSettled 사용으로 일부 실패해도 진행 가능
      const settledResults = await Promise.allSettled(promises)

      // 결과 객체 초기화
      const additionalInfo = {
        disks: [] as ZdmInfoDiskTable[],
        networks: [] as ZdmInfoNetworkTable[],
        partitions: [] as ZdmInfoPartitionTable[],
        repositories: [] as ZdmRepositoryTable[],
      }

      // 성공한 결과만 처리
      settledResults.forEach((settledResult) => {
        if (settledResult.status === "fulfilled") {
          const result = settledResult.value
          additionalInfo[result.type] = result.data
        }
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getAdditionalInfo", state: "end" })
      return additionalInfo
    } catch (error) {
      ContextLogger.error({
        message: "추가 ZDM 정보 조회 - 오류 발생",
        meta: {
          error: error instanceof Error ? error.message : String(error),
          systemNames,
        },
      })
      // 오류가 발생해도 빈 결과를 반환하여 기본 ZDM 정보라도 제공
      // 그렇기 때문에 로깅상에선 종료로 표기
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getAdditionalInfo", state: "end" })
      return {
        disks: [] as ZdmInfoDiskTable[],
        networks: [] as ZdmInfoNetworkTable[],
        partitions: [] as ZdmInfoPartitionTable[],
        repositories: [] as ZdmRepositoryTable[],
      }
    }
  }

  /**
   * ZDM 데이터와 관련 데이터를 조합
   */
  private combineZdmData({
    zdms,
    disks = [],
    networks = [],
    partitions = [],
    repositories = [],
  }: {
    zdms: ZdmInfoTable[]
    disks?: ZdmInfoDiskTable[]
    networks?: ZdmInfoNetworkTable[]
    partitions?: ZdmInfoPartitionTable[]
    repositories?: ZdmRepositoryTable[]
  }): ZdmDataResponse[] {
    try {
      asyncContextStorage.addOrder({ component: this.serviceName, method: "combineZdmData", state: "start" })
      const zdmMap = new Map<string, ZdmDataResponse>()

      // ZDM 기본 정보로 맵 초기화
      zdms.forEach((zdm) => {
        zdmMap.set(zdm.sCenterName, { zdm })
      })

      const addRelatedData = <T extends { sSystemName: string }>({ items, propertyName }: { items: T[]; propertyName: ZdmDataPropertyKey }) => {
        items.forEach((item) => {
          const zdmResponse = zdmMap.get(item.sSystemName)
          if (zdmResponse) {
            // 배열이 없으면 초기화
            if (!zdmResponse[propertyName]) {
              zdmResponse[propertyName as ZdmDataPropertyKey] = []
            }
            // 타입스크립트 타입 단언 필요
            ;(zdmResponse[propertyName] as any[]).push(item)
          }
        })
      }

      // 모든 관련 데이터 처리
      addRelatedData({ items: disks, propertyName: "disk" })
      addRelatedData({ items: networks, propertyName: "network" })
      addRelatedData({ items: partitions, propertyName: "partition" })
      addRelatedData({ items: repositories, propertyName: "repository" })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "combineZdmData", state: "end" })
      return Array.from(zdmMap.values())
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "combineZdmData",
        message: "[ZDM 데이터 조합] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * 모든 ZDM 조회 ( + 추가 데이터 리턴 )
   */
  async getZdms({ filterOptions }: { filterOptions: ZdmFilterOptions }): Promise<ZdmDataResponse[]> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdms", state: "start" })

      //  기본 ZDM 정보 조회
      const zdms = await this.zdmRepository.findAll({ filterOptions })
      const systemNames = zdms.map((zdm) => zdm.sCenterName)
      const { disks, networks, partitions, repositories } = await this.getAdditionalInfo({ filterOptions, systemNames })
      // 데이터 조합
      const result = this.combineZdmData({
        zdms,
        disks,
        networks,
        partitions,
        repositories,
      })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdms", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getZdms",
        message: "[ZDM 정보 목록 조회] - 오류가 발생했습니다",
      })
    }
  }

  /**
   * ZDM 이름으로 조회 ( ZDM 데이터만 조회 )
   */
  async getZdmInfoByName({ name, filterOptions }: { name: string; filterOptions?: ZdmFilterOptions }): Promise<ZdmInfoTable> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmInfoByName", state: "start" })

      const zdm = await this.zdmRepository.findByZdmName({ name, filterOptions })
      if (!zdm) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "getZdmInfoByName",
          message: `이름이 '${name}'인 ZDM을 찾을 수 없습니다`,
        })
      }

      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmInfoByName", state: "end" })
      return zdm
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getZdmInfoByName",
        message: `[ZDM 이름으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * ZDM 이름으로 조회 ( + 추가 데이터 리턴 )
   */
  async getZdmByName({ name, filterOptions }: { name: string; filterOptions?: ZdmFilterOptions }): Promise<ZdmDataResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmByName", state: "start" })

      // getZdmInfoByName 함수를 재사용하여 ZDM 정보 조회
      const zdm = await this.getZdmInfoByName({ name, filterOptions })

      const { disks, networks, partitions, repositories } = await this.getAdditionalInfo({ filterOptions, systemNames: [name] })

      // 데이터 조합
      const result = this.combineZdmData({
        zdms: [zdm],
        disks,
        networks,
        partitions,
        repositories,
      })

      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmByName", state: "end" })
      return result[0]
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getZdmByName",
        message: `[ZDM 이름으로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * ZDM ID로 조회 ( ZDM 데이터만 조회 )
   */
  async getZdmInfoById({ id, filterOptions }: { id: string; filterOptions?: ZdmFilterOptions }): Promise<ZdmInfoTable> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmInfoById", state: "start" })
      if (!regNumberOnly.test(id)) {
        throw ServiceError.validationError(ServiceError, {
          method: "getZdmInfoById",
          message: `ZDM ID는 숫자만 포함해야 합니다. 입력값: '${id}'`,
          metadata: { id },
        })
      }
      const zdm = await this.zdmRepository.findByZdmId({ id: parseInt(id), filterOptions })
      if (!zdm) {
        throw ServiceError.resourceNotFoundError(ServiceError, {
          method: "getZdmInfoById",
          message: `ID가 '${id}'인 ZDM을 찾을 수 없습니다`,
          metadata: { id },
        })
      }
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmInfoById", state: "end" })
      return zdm
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getZdmInfoById",
        message: `[ZDM ID로 조회] - 오류가 발생했습니다`,
      })
    }
  }

  /**
   * ZDM ID로 조회 ( + 추가 데이터 리턴 )
   */
  async getZdmById({ id, filterOptions }: { id: string; filterOptions: ZdmFilterOptions }): Promise<ZdmDataResponse> {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmById", state: "start" })

      // getZdmInfoById 함수를 재사용하여 ZDM 정보 조회
      const zdm = await this.getZdmInfoById({ id, filterOptions })

      const { disks, networks, partitions, repositories } = await this.getAdditionalInfo({
        filterOptions,
        systemNames: [zdm.sCenterName],
      })

      // 데이터 조합
      const result = this.combineZdmData({
        zdms: [zdm],
        disks,
        networks,
        partitions,
        repositories,
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "getZdmById", state: "end" })
      return result[0]
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "getZdmById",
        message: `[ZDM ID로 조회] - 오류가 발생했습니다`,
      })
    }
  }
}
