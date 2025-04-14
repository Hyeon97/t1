//////////////////////////////
//  Schedule 정보 응답 DTO  //
//////////////////////////////

import { ScheduleInfoTable } from "../../types/db/schedule-info"
import { ScheduleStatusMap, ScheduleStatusType, ScheduleType, ScheduleTypeMap } from "../../types/schedule-common.type"
import { DEFAULT_VALUES_SCHEDULE_RESPONSE, ScheduleDataResponse, ScheduleResponseFields } from "../../types/schedule-response.type"

export class ScheduleResponseDTO implements ScheduleResponseFields {
  id: string
  center: string
  type: ScheduleType | string
  state: ScheduleStatusType | string
  jobName: string
  lastRunTime: string
  description: string

  constructor({
    id = DEFAULT_VALUES_SCHEDULE_RESPONSE.id,
    center = DEFAULT_VALUES_SCHEDULE_RESPONSE.center,
    type = DEFAULT_VALUES_SCHEDULE_RESPONSE.type,
    state = DEFAULT_VALUES_SCHEDULE_RESPONSE.state,
    jobName = DEFAULT_VALUES_SCHEDULE_RESPONSE.jobName,
    lastRunTime = DEFAULT_VALUES_SCHEDULE_RESPONSE.lastRunTime,
    description = DEFAULT_VALUES_SCHEDULE_RESPONSE.description,
  }: Partial<ScheduleResponseFields> = {}) {
    this.id = id
    this.center = center
    this.type = type
    this.state = state
    this.jobName = jobName
    this.lastRunTime = lastRunTime
    this.description = description
  }

  /**
   * JSON 직렬화를 위한 메서드
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      center: this.center,
      type: this.type,
      state: this.state,
      jobName: this.jobName,
      lastRunTime: this.lastRunTime,
      description: this.description,
    }
  }

  /**
   * 엔티티에서 기본 DTO로 변환하는 정적 메서드
   */
  static fromEntity({ scheduleData }: { scheduleData: ScheduleInfoTable }): ScheduleResponseDTO {
    return new ScheduleResponseDTO({
      id: String(scheduleData.nID),
      center: DEFAULT_VALUES_SCHEDULE_RESPONSE.center, // scheduleData.center,
      type: ScheduleTypeMap.toString({ value: scheduleData.nScheduleType }),
      state: ScheduleStatusMap.toString({ value: scheduleData.nStatus }),
      jobName: scheduleData.sJobName || DEFAULT_VALUES_SCHEDULE_RESPONSE.jobName,
      lastRunTime: scheduleData.sLastRunTime || DEFAULT_VALUES_SCHEDULE_RESPONSE.lastRunTime,
      description: DEFAULT_VALUES_SCHEDULE_RESPONSE.description,
    })
  }

  /**
   * 엔티티 배열에서 기본 DTO 배열로 변환
   */
  static fromEntities({ schedules }: { schedules: ScheduleDataResponse | ScheduleInfoTable[] }): ScheduleResponseDTO[] {
    if ("items" in schedules) {
      return schedules.items.map((scheduleData) => ScheduleResponseDTO.fromEntity({ scheduleData }))
    }
    return schedules.map((scheduleData) => ScheduleResponseDTO.fromEntity({ scheduleData }))
  }
}
