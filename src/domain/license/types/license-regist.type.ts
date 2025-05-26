////////////////////////////////////
//  License 등록 관련 인터페이스 정의 //
////////////////////////////////////


/**
 * License 등록 user input
 */
export interface LicenseRegistRequestBody {
  //  필수
  center: string  //  License를 등록할 센터 이름 or ID (숫자만 있는 경우)
  key: string //  License 키
  centerUUID: string  //  센터 UUID ( License 등록시 검증용 )
  //  선택
  name?: string //  License 이름
  desc?: string //  License 설명
}