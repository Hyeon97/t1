import { ServiceError } from "../../../errors/service/service-error"
import { BaseService } from "../../../utils/base/base-service"
import { regNumberOnly } from "../../../utils/regex.utils"
import { ServerBasicRepository } from "../repositories/server-basic.repository"
import { ServerPartitionRepository } from "../repositories/server-partition.repository"
import { ServerBasicTable } from "../types/db/server-basic"
import { ServerPartitionFilterOptions } from "../types/server-partition-filter.type"
import { ServerPartitionDataResponse } from "../types/server-partition-response.type"

export class ServerPartitionService extends BaseService {
  private readonly serverBasicRepository: ServerBasicRepository
  private readonly serverPartitionRepository: ServerPartitionRepository
  constructor({
    serverBasicRepository,
    serverPartitionRepository,
  }: {
    serverBasicRepository: ServerBasicRepository
    serverPartitionRepository: ServerPartitionRepository
  }) {
    super({
      serviceName: "ServerPartitionService",
    })
    this.serverBasicRepository = serverBasicRepository
    this.serverPartitionRepository = serverPartitionRepository
  }

  /**
   * Server 정보 가져오기 ( by ID )
   */
  private async getServerById({ id }: { id: number }): Promise<ServerBasicTable> {
    try {
      const server = await this.serverBasicRepository.findByServerId({ id, filterOptions: {} })
      if (!server) {
        throw ServiceError.resourceNotFoundError({
          functionName: "getServerById",
          message: `Server ID ${id}에 해당하는 Server를 찾을 수 없습니다.`,
        })
      }
      return server
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getServerById",
        message: "Server 정보 조회 중 오류가 발생했습니다",
      })
    }
  }

  /**
   * Server 정보 가져오기 ( by Name )
   */
  private async getServerByName({ name }: { name: string }): Promise<ServerBasicTable> {
    try {
      const server = await this.serverBasicRepository.findByServerName({ name, filterOptions: {} })
      if (!server) {
        throw ServiceError.resourceNotFoundError({
          functionName: "getServerByName",
          message: `Server Name ${name}에 해당하는 Server를 찾을 수 없습니다.`,
        })
      }
      return server
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getServerByName",
        message: "Server 정보 조회 중 오류가 발생했습니다",
      })
    }
  }

  /**
   * 모든 Partition 정보 조회
   */
  async getPartitionList({ filterOptions }: { filterOptions: ServerPartitionFilterOptions }): Promise<ServerPartitionDataResponse> {
    try {
      //  만약 filterOptions.server 타입이 number 즉 server id 인 경우에는 server sSystemName 값을 가져와야 함
      if (typeof filterOptions.server === "number" || regNumberOnly.test(filterOptions.server as string)) {
        filterOptions.server = (await this.getServerById({ id: filterOptions.server as number }))!.sSystemName
      }
      const partitions = await this.serverPartitionRepository.findAll({ filterOptions })
      return { items: partitions }
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getPartitionList",
        message: "Server Partition 조회 중 오류가 발생했습니다",
      })
    }
  }

  /**
   * Server ID로 조회
   */
  async getPartitionListByServerId({ id }: { id: number }): Promise<ServerPartitionDataResponse> {
    try {
      //  Server ID로는 조회가 불가능해서 Server name 값을 가져와야 함
      const systemNames = [(await this.getServerById({ id })).sSystemName]
      const partitions = await this.serverPartitionRepository.findBySystemNames({ systemNames })

      return { items: partitions }
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getPartitionListByServerId",
        message: "Server Partition 조회 중 오류가 발생했습니다",
      })
    }
  }

  /**
   * Server name으로 조회
   */
  async getPartitionListByServerName({ name }: { name: string }): Promise<ServerPartitionDataResponse> {
    try {
      const partitions = await this.serverPartitionRepository.findByServerName({ name, filterOptions: {} })
      return { items: partitions }
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getPartitionListByServerName",
        message: "Server Partition 조회 중 오류가 발생했습니다",
      })
    }
  }
}
