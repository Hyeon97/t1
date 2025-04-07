import { ServiceError } from "../../../errors/service/service-error"


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
   * Server 정보 가져오기
   */
  private async getServer({ id }: { id: number }) {
    try {
      const server = await this.serverBasicRepository.findByServerId({ id, filterOptions: {} })
      if (!server) {
        throw ServiceError.resourceNotFoundError({
          functionName: "getServer",
          message: `Server ID ${id}에 해당하는 Server를 찾을 수 없습니다.`,
        })
      }
      return server
    } catch (error) {
      return this.handleServiceError({
        error,
        functionName: "getServer",
        message: "Server 정보 조회 중 오류가 발생했습니다",
      })
    }
  }

  /**
   * 모든 Partition 정보 조회
   */
  async getPartitionList({ filterOptions }: { filterOptions: ServerPartitionFilterOptions }): Promise<ServerPartitionDataResponse> {
    try {
      //  만약 filterOptions.server 타입이 number 즉 server id 인 경우에는 server nID 값을 가져와야 함
      if (typeof filterOptions.server === "number" || regNumberOnly.test(filterOptions.server as string)) {
        filterOptions.server = (await this.getServer({ id: filterOptions.server as number }))!.nID
      }
      const partitions = await this.serverPartitionRepository.findAll({ filterOptions })
      if (!partitions.length) {
        throw ServerError.notFound({ type: "partition" })
      }
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
      const systemNames = [(await this.getServer({ id })).sSystemName]
      const partitions = await this.serverPartitionRepository.findBySystemNames({ systemNames })
      if (!partitions.length) {
        throw ServerError.notFound({ type: "partition" })
      }
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
      if (!partitions.length) {
        throw ServerError.notFound({ type: "partition" })
      }
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