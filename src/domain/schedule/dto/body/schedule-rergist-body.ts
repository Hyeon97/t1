/////////////////////////////////
//  Schedule 작업 등록 Body DTO //
/////////////////////////////////

import { Expose, Type } from "class-transformer"
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from "class-validator"
import { ScheduleTypeEnum } from "../../types/schedule-common.type"
import { ScheduleDetail, ScheduleDetailInterval, ScheduleRegistRequestBody } from "../../types/schedule-regist.type"

/**
 * interval 객체 검증
 */
export class ScheduleDetailBodyIntervalDTO implements ScheduleDetailInterval {
  @Expose()
  @IsDefined({ message: "hour가 누락되었습니다." })
  hour!: string

  @Expose()
  @IsDefined({ message: "minute이 누락되었습니다." })
  minute!: string
}

/**
 * full, increment 객체 검증
 */
export class ScheduleDetailBodyDTO implements ScheduleDetail {
  @Expose()
  @IsDefined({ message: "year가 누락되었습니다." })
  year!: string

  @Expose()
  @IsDefined({ message: "month가 누락되었습니다." })
  month!: string

  @Expose()
  @IsDefined({ message: "week가 누락되었습니다." })
  week!: string

  @Expose()
  @IsDefined({ message: "day가 누락되었습니다." })
  day!: string

  @Expose()
  @IsDefined({ message: "time이 누락되었습니다." })
  time!: string

  @Expose()
  @IsDefined({ message: "interval이 누락되었습니다." })
  @Type(() => ScheduleDetailBodyIntervalDTO)
  @ValidateNested()
  interval!: ScheduleDetailBodyIntervalDTO
}

/**
 * Schedule data 등록 DTO
 * 전체 body 형태만 간단 검증, 상세 검증은 Service Layer에서 진행
 */
export class ScheduleRegistBodyDTO implements ScheduleRegistRequestBody {
  //  필수
  //  center 이름 or ID
  @Expose()
  @IsNotEmpty({ message: "center가 누락되었습니다." })
  center!: string

  //  center 이름 or ID
  @Expose()
  @IsOptional()
  @IsNotEmpty({ message: "user가 누락되었습니다." })
  user?: string

  //  작업 이름
  @Expose()
  @IsOptional()
  jobName?: string

  //  Schedule 관련 정보
  @Expose()
  @IsNotEmpty({ message: "type이 누락되었습니다." })
  @IsEnum(ScheduleTypeEnum, { message: "유효한 스케줄 타입이 아닙니다. (0 ~ 11 만 가능)" })
  type!: ScheduleTypeEnum //  0 ~ 11 까지

  //  full schedule
  @Expose()
  @IsOptional()
  @Type(() => ScheduleDetailBodyDTO)
  @ValidateNested()
  full!: ScheduleDetailBodyDTO

  //  increment schedule
  @Expose()
  @IsOptional()
  @Type(() => ScheduleDetailBodyDTO)
  @ValidateNested()
  increment!: ScheduleDetailBodyDTO
}
