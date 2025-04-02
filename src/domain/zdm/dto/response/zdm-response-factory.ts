///////////////////////////////
//  ZDM 응답 DTO 생성 팩토리  //
///////////////////////////////

import { ZdmDataResponse } from "../../types/zdm/zdm-response.type"
import { ZdmResponseBaseDTO } from "./zdm-response-base.dto"
import { ZdmResponseDetailDTO } from "./zdm-response-detail.dto"

export class ZdmResponseFactory {
  /**
   * 단일 엔티티에서 응답 DTO 생성
   */
  static createFromEntity({ detail, zdmData }: { detail: boolean; zdmData: ZdmDataResponse }): ZdmResponseBaseDTO | ZdmResponseDetailDTO {
    return detail ? ZdmResponseDetailDTO.fromEntity({ zdmData }) : ZdmResponseBaseDTO.fromEntity({ zdmData })
  }

  /**
   * 엔티티 배열에서 응답 DTO 배열 생성
   */
  static createFromEntities({ detail, zdmsData }: { detail: boolean; zdmsData: ZdmDataResponse[] }): (ZdmResponseBaseDTO | ZdmResponseDetailDTO)[] {
    return detail ? ZdmResponseDetailDTO.fromEntities({ zdmsData }) : ZdmResponseBaseDTO.fromEntities({ zdmsData })
  }
}
