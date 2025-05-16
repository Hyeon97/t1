////////////////////////////////
//  Zdm data 조회 파라미터 DTO  //
////////////////////////////////

import { Expose } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

/**
 * Zdm 이름으로 조회
 */
export class ZdmGetByNameDTO {
  @IsNotEmpty({ message: "ZdmName은 필수 입니다." })
  @IsString()
  @Expose()
  zdmName!: string
}

/**
 * Zdm ID로 조회
 */
export class ZdmGetByIdDTO {
  @IsNotEmpty({ message: "ZdmID는 필수 입니다." })
  @IsNumber()
  @Expose()
  zdmId!: number
}