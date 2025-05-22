////////////////////////////////////
//  License 할당 관련 인터페이스 정의 //
////////////////////////////////////

/**
 * License 할당 user input
 */
export class LicenseAssignRequestBody {
  server!: string //  license 할당할 server 이름 or id (숫자만 있는 경우)
  license!: string  //  할당할 license 이름 or id (숫자만 있는 경우)
}