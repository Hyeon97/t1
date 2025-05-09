//////////////////////////////////////
//  Schedule 관련 공통 사용 dto 정의  //
/////////////////////////////////////

import { Expose, Type } from 'class-transformer'
import { IsOptional, ValidateNested } from 'class-validator'
import { ScheduleBody } from '../../domain/schedule/dto/body/schedule-rergist-body'
import { ScheduleTypeEnum } from '../../domain/schedule/types/schedule-common.type'
import { ScheduleDetail, ScheduleDetailInterval } from '../../domain/schedule/types/schedule-regist.type'


// export class JobRegistScheduleDTO implements ScheduleBody {
//   @IsOptional()
//   @Expose()
//   type?: ScheduleTypeEnum // 0 ~ 11 까지

//   @IsOptional()
//   @Expose()
//   full?: ScheduleDetail //  숫자만 존재(string): zdm에 등록된 schedule ID || ScheduleDetail: 신규 등록

//   @IsOptional()
//   @Expose()
//   increment?: ScheduleDetail //  숫자만 존재(string): zdm에 등록된 schedule ID || ScheduleDetail: 신규 등록
// }

export class ScheduleDetailIntervalDTO implements ScheduleDetailInterval {
  @IsOptional()
  @Expose()
  hour: string = ''

  @IsOptional()
  @Expose()
  minute: string = ''
}


export class ScheduleDetailDTO implements ScheduleDetail {
  @IsOptional()
  @Expose()
  year: string = ''

  @IsOptional()
  @Expose()
  month: string = ''

  @IsOptional()
  @Expose()
  week: string = ''

  @IsOptional()
  @Expose()
  day: string = ''

  @IsOptional()
  @Expose()
  time: string = ''

  @IsOptional()
  @Expose()
  @Type(() => ScheduleDetailIntervalDTO)
  @ValidateNested()
  interval!: ScheduleDetailIntervalDTO
}

/**
 * 작업 등록시 schedule 입력 양식 ( main )
 */
export class JobRegistScheduleDTO implements ScheduleBody {
  @IsOptional()
  @Expose()
  type?: ScheduleTypeEnum // 0 ~ 11 까지

  @IsOptional()
  @Type(() => ScheduleDetailDTO)
  @Expose()
  full?: string | ScheduleDetailDTO

  @IsOptional()
  @Type(() => ScheduleDetailDTO)
  @Expose()
  increment?: string | ScheduleDetailDTO
}
