import { ZdmError } from "../../../errors/domain-errors/ZdmError"
import { handleServiceError } from "../../../errors/handler/integration-error-handler"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../utils/regex.utils"
import { ZdmDiskRepository } from "../repositories/center-info-disk.repository"
import { ZdmNetworkRepository } from "../repositories/center-info-network.repository"
import { ZdmPartitionRepository } from "../repositories/center-info-partition.repository"
import { ZdmRepository } from "../repositories/center-info.repository"
import { ZdmRepositoryRepository } from "../repositories/center-repository.repository"
import { ZdmZosRepositoryRepository } from "../repositories/center-zos-repository.repository"
import { ZdmInfoTable } from "../types/db/center-info"
import { ZdmInfoDiskTable } from "../types/db/center-info-disk"
import { ZdmInfoNetworkTable } from "../types/db/center-info-network"
import { ZdmInfoPartitionTable } from "../types/db/center-info-partition"
import { ZdmRepositoryTable } from "../types/db/center-repository"
import { ZdmFilterOptions } from "../types/zdm/zdm-filter.type"
import { ZdmDataResponse } from "../types/zdm/zdm-response.type"

type AdditionalInfoKey = "disks" | "networks" | "partitions" | "repositories"
type ZdmDataPropertyKey = Exclude<keyof ZdmDataResponse, "zdm">

export class ZdmService {
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
  private async getAdditionalInfo({ filterOptions, systemNames = [] }: { filterOptions: ZdmFilterOptions; systemNames?: string[] }) {
    try {
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
          condition: !!filterOptions.disk,
          type: "disks",
          repository: this.zdmDiskRepository,
          errorMessage: "디스크 정보 조회 중 오류 발생",
        },
        {
          condition: !!filterOptions.network,
          type: "networks",
          repository: this.zdmNetworkRepository,
          errorMessage: "네트워크 정보 조회 중 오류 발생",
        },
        {
          condition: !!filterOptions.partition,
          type: "partitions",
          repository: this.zdmPartitionRepository,
          errorMessage: "파티션 정보 조회 중 오류 발생",
        },
        {
          condition: !!filterOptions.repository,
          type: "repositories",
          repository: this.zdmRepositoryRepository,
          errorMessage: "레포지토리 정보 조회 중 오류 발생",
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

      return additionalInfo
    } catch (error) {
      ContextLogger.error({
        message: "추가 ZDM 정보 조회 중 오류 발생",
        meta: {
          error: error instanceof Error ? error.message : String(error),
          systemNames,
        },
      })

      // 오류가 발생해도 빈 결과를 반환하여 기본 ZDM 정보라도 제공
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
          ; (zdmResponse[propertyName] as any[]).push(item)
        }
      })
    }

    // 모든 관련 데이터 처리
    addRelatedData({ items: disks, propertyName: "disk" })
    addRelatedData({ items: networks, propertyName: "network" })
    addRelatedData({ items: partitions, propertyName: "partition" })
    addRelatedData({ items: repositories, propertyName: "repository" })

    return Array.from(zdmMap.values())
  }

  /**
   * 모든 ZDM 조회
   */
  async getZdms({ filterOptions }: { filterOptions: ZdmFilterOptions }): Promise<ZdmDataResponse[]> {
    try {
      ContextLogger.debug({ message: `모든 Zdm 정보 조회`, meta: { filterOptions } })
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
      return result
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "Zdm 정보 조회 중 ZdmService.getZdms() 오류 발생",
        apiErrorMessage: "Zdm 정보 조회 중 오류가 발생했습니다",
        operation: "zdm 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }

  /**
   * ZDM 이름으로 조회
   */
  async getZdmByName({ name, filterOptions }: { name: string; filterOptions: ZdmFilterOptions }): Promise<ZdmDataResponse> {
    try {
      const zdm = await this.zdmRepository.findByZdmName({ name, filterOptions })
      if (!zdm) {
        throw new ZdmError.ZdmNotFound({ zdm: name, type: "name" })
      }
      const { disks, networks, partitions, repositories } = await this.getAdditionalInfo({ filterOptions, systemNames: [name] })
      // 데이터 조합
      const result = this.combineZdmData({
        zdms: [zdm],
        disks,
        networks,
        partitions,
        repositories,
      })

      return result[0]
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "Zdm 정보 조회 중 ZdmService.getZdmByName() 오류 발생",
        apiErrorMessage: "Zdm 정보 조회 중 오류가 발생했습니다",
        operation: "단일 zdm 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }

  /**
   * ZDM ID로 조회
   */
  async getZdmById({ id, filterOptions }: { id: string; filterOptions: ZdmFilterOptions }): Promise<ZdmDataResponse> {
    try {
      if (!regNumberOnly.test(id)) {
        throw new ZdmError.ZdmRequestParameterError({
          message: `identifierType이 id인 경우 identifier값은 숫자만 가능합니다`,
          details: {
            identifierType: "id",
            identifier: id,
          },
        })
      }
      const zdm = await this.zdmRepository.findByZdmId({ id: parseInt(id), filterOptions })
      if (!zdm) {
        throw new ZdmError.ZdmNotFound({ zdm: id, type: "id" })
      }
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

      return result[0]
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "Zdm 정보 조회 중 ZdmService.getZdmById() 오류 발생",
        apiErrorMessage: "Zdm 정보 조회 중 오류가 발생했습니다",
        operation: "단일 zdm 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ZdmError.DataProcessingError(params),
      })
    }
  }
}
