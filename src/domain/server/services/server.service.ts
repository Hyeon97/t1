import { ServerError } from "../../../errors/domain-errors/ServerError"
import { handleServiceError } from "../../../errors/handler/integration-error-handler"
import { ContextLogger } from "../../../utils/logger/logger.custom"
import { regNumberOnly } from "../../../utils/regex.utils"
import { ServerBasicRepository } from "../repositories/server-basic.repository"
import { ServerDiskRepository } from "../repositories/server-disk.repository"
import { ServerNetworkRepository } from "../repositories/server-network.repository"
import { ServerPartitionRepository } from "../repositories/server-partition.repository"
import { ServerRepositoryRepository } from "../repositories/server-repository.repository"
import { ServerBasicTable } from "../types/db/server-basic"
import { ServerDiskTable } from "../types/db/server-disk"
import { ServerNetworkTable } from "../types/db/server-network"
import { ServerPartitionTable } from "../types/db/server-partition"
import { ServerRepositoryTable } from "../types/db/server-repository"
import { ServerFilterOptions } from "../types/server-filter.type"
import { ServerDataResponse } from "../types/server-response.type"

type AdditionalInfoKey = "disks" | "networks" | "partitions" | "repositories"
type ServerDataPropertyKey = Exclude<keyof ServerDataResponse, "server">

export class ServerService {
  private readonly serverBasicRepository: ServerBasicRepository
  private readonly serverDiskRepository: ServerDiskRepository
  private readonly serverPartitionRepository: ServerPartitionRepository
  private readonly serverNetworkRepository: ServerNetworkRepository
  private readonly serverRepositoryRepository: ServerRepositoryRepository
  constructor({
    serverBasicRepository,
    serverDiskRepository,
    serverPartitionRepository,
    serverNetworkRepository,
    serverRepositoryRepository,
  }: {
    serverBasicRepository: ServerBasicRepository
    serverDiskRepository: ServerDiskRepository
    serverPartitionRepository: ServerPartitionRepository
    serverNetworkRepository: ServerNetworkRepository
    serverRepositoryRepository: ServerRepositoryRepository
  }) {
    this.serverBasicRepository = serverBasicRepository
    this.serverDiskRepository = serverDiskRepository
    this.serverPartitionRepository = serverPartitionRepository
    this.serverNetworkRepository = serverNetworkRepository
    this.serverRepositoryRepository = serverRepositoryRepository
  }
  /**
   * 서버 추가정보 가져오기
   */
  private async getAdditionalInfo({ filterOptions, systemNames = [] }: { filterOptions: ServerFilterOptions; systemNames?: string[] }) {
    try {
      // 시스템 이름이 없거나 빈 배열이면 빈 결과 반환
      if (!systemNames.length) {
        return {
          disks: [] as ServerDiskTable[],
          networks: [] as ServerNetworkTable[],
          partitions: [] as ServerPartitionTable[],
          repositories: [] as ServerRepositoryTable[],
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
          repository: this.serverDiskRepository,
          errorMessage: "디스크 정보 조회 중 오류 발생",
        },
        {
          condition: !!filterOptions.network,
          type: "networks",
          repository: this.serverNetworkRepository,
          errorMessage: "네트워크 정보 조회 중 오류 발생",
        },
        {
          condition: !!filterOptions.partition,
          type: "partitions",
          repository: this.serverPartitionRepository,
          errorMessage: "파티션 정보 조회 중 오류 발생",
        },
        {
          condition: !!filterOptions.repository,
          type: "repositories",
          repository: this.serverRepositoryRepository,
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
        disks: [] as ServerDiskTable[],
        networks: [] as ServerNetworkTable[],
        partitions: [] as ServerPartitionTable[],
        repositories: [] as ServerRepositoryTable[],
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
        message: "추가 서버 정보 조회 중 오류 발생",
        meta: {
          error: error instanceof Error ? error.message : String(error),
          systemNames,
        },
      })

      // 오류가 발생해도 빈 결과를 반환하여 기본 서버 정보라도 제공
      return {
        disks: [] as ServerDiskTable[],
        networks: [] as ServerNetworkTable[],
        partitions: [] as ServerPartitionTable[],
        repositories: [] as ServerRepositoryTable[],
      }
    }
  }

  /**
   * 서버 데이터와 관련 데이터를 조합
   */
  private combineServerData({
    servers,
    disks = [],
    networks = [],
    partitions = [],
    repositories = [],
  }: {
    servers: ServerBasicTable[]
    disks?: ServerDiskTable[]
    networks?: ServerNetworkTable[]
    partitions?: ServerPartitionTable[]
    repositories?: ServerRepositoryTable[]
  }): ServerDataResponse[] {
    const serverMap = new Map<string, ServerDataResponse>()

    // 서버 기본 정보로 맵 초기화
    servers.forEach((server) => {
      serverMap.set(server.sSystemName, { server })
    })

    const addRelatedData = <T extends { sSystemName: string }>({ items, propertyName }: { items: T[]; propertyName: ServerDataPropertyKey }) => {
      items.forEach((item) => {
        const serverResponse = serverMap.get(item.sSystemName)
        if (serverResponse) {
          // 배열이 없으면 초기화
          if (!serverResponse[propertyName]) {
            serverResponse[propertyName as ServerDataPropertyKey] = []
          }
          // 타입스크립트 타입 단언 필요
          ;(serverResponse[propertyName] as any[]).push(item)
        }
      })
    }

    // 모든 관련 데이터 처리
    addRelatedData({ items: disks, propertyName: "disk" })
    addRelatedData({ items: networks, propertyName: "network" })
    addRelatedData({ items: partitions, propertyName: "partition" })
    addRelatedData({ items: repositories, propertyName: "repository" })

    return Array.from(serverMap.values())
  }

  /**
   * 모든 서버 조회
   */
  async getServers({ filterOptions }: { filterOptions: ServerFilterOptions }): Promise<ServerDataResponse[]> {
    try {
      ContextLogger.debug({ message: `모든 Server 정보 조회`, meta: { filterOptions } })
      const servers = await this.serverBasicRepository.findAll({ filterOptions })
      const systemNames = servers.map((server) => server.sSystemName)

      const { disks, networks, partitions, repositories } = await this.getAdditionalInfo({ filterOptions, systemNames })

      // 데이터 조합
      const result = this.combineServerData({
        servers,
        disks,
        networks,
        partitions,
        repositories,
      })

      return result
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "Server 정보 조회 중 ServerService.getServers() 오류 발생",
        apiErrorMessage: "Server 정보 조회 중 오류가 발생했습니다",
        operation: "server 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ServerError.DataProcessingError(params),
      })
    }
  }

  /**
   * 서버 이름으로 조회
   */
  async getServerByName({ name, filterOptions }: { name: string; filterOptions: ServerFilterOptions }): Promise<ServerDataResponse> {
    try {
      const server = await this.serverBasicRepository.findByServerName({ name, filterOptions })
      if (!server) {
        throw new ServerError.ServerNotFound({ server: name, type: "name" })
      }
      const { disks, networks, partitions, repositories } = await this.getAdditionalInfo({ filterOptions, systemNames: [name] })
      // 데이터 조합
      const result = this.combineServerData({
        servers: [server],
        disks,
        networks,
        partitions,
        repositories,
      })

      return result[0]
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "Server 정보 조회 중 ServerService.getServerByName() 오류 발생",
        apiErrorMessage: "Server 정보 조회 중 오류가 발생했습니다",
        operation: "단일 server 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ServerError.DataProcessingError(params),
      })
    }
  }

  /**
   * 서버 ID로 조회
   */
  async getServerById({ id, filterOptions }: { id: string; filterOptions: ServerFilterOptions }): Promise<ServerDataResponse> {
    try {
      if (!regNumberOnly.test(id)) {
        throw new ServerError.ServerRequestParameterError({
          message: `identifierType이 id인 경우 identifier값은 숫자만 가능합니다`,
          details: {
            identifierType: "id",
            identifier: id,
          },
        })
      }
      const server = await this.serverBasicRepository.findByServerId({ id: parseInt(id), filterOptions })
      if (!server) {
        throw new ServerError.ServerNotFound({ server: id, type: "id" })
      }
      const { disks, networks, partitions, repositories } = await this.getAdditionalInfo({
        filterOptions,
        systemNames: [server.sSystemName],
      })

      // 데이터 조합
      const result = this.combineServerData({
        servers: [server],
        disks,
        networks,
        partitions,
        repositories,
      })

      return result[0]
    } catch (error) {
      return handleServiceError({
        error,
        logErrorMessage: "Server 정보 조회 중 ServerService.getServerById() 오류 발생",
        apiErrorMessage: "Server 정보 조회 중 오류가 발생했습니다",
        operation: "단일 server 조회",
        // processingStage: "조회",
        errorCreator: (params) => new ServerError.DataProcessingError(params),
      })
    }
  }
}
