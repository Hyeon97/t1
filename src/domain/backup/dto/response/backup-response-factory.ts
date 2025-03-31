//////////////////////////////////
//  Backup 응답 DTO 생성 팩토리  //
//////////////////////////////////

import { ServerDataResponse } from "../../types/backup-response.type"
import { ServerResponseBaseDTO } from "./backup-response-base.dto"
import { ServerResponseDetailDTO } from "./backup-response-detail.dto"

export class ServerResponseFactory {
  /**
   * 단일 엔티티에서 응답 DTO 생성
   */
  static createFromEntity({
    detail,
    serverData,
  }: {
    detail: boolean
    serverData: ServerDataResponse
  }): ServerResponseBaseDTO | ServerResponseDetailDTO {
    return detail ? ServerResponseDetailDTO.fromEntity({ serverData }) : ServerResponseBaseDTO.fromEntity({ serverData })
  }

  /**
   * 엔티티 배열에서 응답 DTO 배열 생성
   */
  static createFromEntities({
    detail,
    serversData,
  }: {
    detail: boolean
    serversData: ServerDataResponse[]
  }): (ServerResponseBaseDTO | ServerResponseDetailDTO)[] {
    return detail ? ServerResponseDetailDTO.fromEntities({ serversData }) : ServerResponseBaseDTO.fromEntities({ serversData })
  }
}
