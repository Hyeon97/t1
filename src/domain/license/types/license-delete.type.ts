////////////////////////////////////
//  License 삭제 관련 인터페이스 정의 //
////////////////////////////////////


/**
 * License 삭제 user input
 */
export interface LicenseDeleteRequestBody {
  //  필수
  center: string  //  License를 삭제할 센터 이름 or ID (숫자만 있는 경우)
  key: string //  License 키
  centerUUID: string  //  센터 UUID ( License 삭제시 검증용 )
  //  선택
  name?: string //  License 이름
  desc?: string //  License 설명
}