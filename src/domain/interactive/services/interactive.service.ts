import { asyncContextStorage } from "../../../utils/AsyncContext"
import { BaseService } from "../../../utils/base/base-service"
import { JobInteractiveRepository } from "../repositories/job-interactive.repository"
import { JobInteractiveLicenseRegistInput, JobInteractiveLicenseVerificationInput } from "../types/interactive"

export class JobInteractiveService extends BaseService {
  private readonly jobInteractiveRepository: JobInteractiveRepository
  constructor({ jobInteractiveRepository }: { jobInteractiveRepository: JobInteractiveRepository }) {
    super({
      serviceName: "JobInteractiveService",
    })
    this.jobInteractiveRepository = jobInteractiveRepository
  }

  /**
   * JobInteractiveService - license 검증 enable/disable 토글
   */
  async toggleLicenseVerification({ data }: { data: JobInteractiveLicenseVerificationInput }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "toggleLicenseVerification", state: "start" })

      //  license 검증 enable/disable 데이터 추가
      await this.jobInteractiveRepository.insertDataWithOutTransaction({ data })
      const result = await this.executeTransaction({
        callback: async (transaction) => {
          //  반복적으로 상태 확인해서 해당 커멘드 결과가 SUCCESS로 떨어지는지 체크
          //  default: 1초 간격으로 5번 반복
          const timeout = 5000 // 최대 대기 시간: 5초
          const interval = 500 // 상태 확인 주기: 0.5초
          // 반복적으로 상태를 확인하며 SUCCESS 여부 체크
          return await new Promise<{ result: boolean, msg?: string }>((resolve, reject) => {
            const start = Date.now()
            const checkInterval = setInterval(async () => {
              try {
                if (Date.now() - start >= timeout) {
                  clearInterval(checkInterval)
                  reject(new Error("Operation timed out: Status did not change to SUCCESS")) // 타임아웃 에러 반환
                  return
                }

                const result = await this.jobInteractiveRepository.findByRequestID({ requestID: data.nRequestID })
                // SUCCESS 상태이면 true 반환
                if (result?.sJobResult === "SUCCESS") {
                  clearInterval(checkInterval)
                  resolve({ result: true })
                }
                else if (result?.sJobResult === "FAILED") {
                  clearInterval(checkInterval)
                  reject(new Error(`Operation failed: ${result.sDescription}`))
                }
              } catch (error: any) {
                clearInterval(checkInterval) // 인터벌 중단
                reject(new Error(`Error during status check: ${error.message}`)) // Promise를 종료하고 에러 반환
              }
            }, interval)
          })
        },
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "toggleLicenseVerification", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "toggleLicenseVerification",
        message: "[Interactive] - License 검증 절차 enable/disable 중 오류 발생",
      })
    }
  }

  /**
   * JobInteractiveService - license 검증
   */
  async licenseVerification({ data }: { data: JobInteractiveLicenseRegistInput }) {
    try {
      asyncContextStorage.addService({ name: this.serviceName })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "licenseVerification", state: "start" })

      //  license 검증 데이터 추가
      await this.jobInteractiveRepository.insertDataWithOutTransaction({ data })
      const result = await this.executeTransaction({
        callback: async (transaction) => {
          //  반복적으로 상태 확인해서 해당 커멘드 결과가 SUCCESS로 떨어지는지 체크
          //  default: 1초 간격으로 5번 반복
          const timeout = 5000 // 최대 대기 시간: 5초
          const interval = 500 // 상태 확인 주기: 0.5초
          // 반복적으로 상태를 확인하며 SUCCESS 여부 체크
          return await new Promise<{ result: boolean, msg?: string }>((resolve, reject) => {
            const start = Date.now()
            const checkInterval = setInterval(async () => {
              try {
                if (Date.now() - start >= timeout) {
                  clearInterval(checkInterval)
                  reject(new Error("Operation timed out: Status did not change to SUCCESS")) // 타임아웃 에러 반환
                  return
                }

                const result = await this.jobInteractiveRepository.findByRequestID({ requestID: data.nRequestID })
                // SUCCESS 상태이면 true 반환
                if (result?.sJobResult === "SUCCESS") {
                  clearInterval(checkInterval)
                  resolve({ result: true })
                }
                else if (result?.sJobResult === "FAILED") {
                  clearInterval(checkInterval)
                  reject(new Error(`Operation failed: ${result.sDescription}`))
                  // resolve({ result: false, msg: result.sDescription })
                }
              } catch (error: any) {
                clearInterval(checkInterval) // 인터벌 중단
                reject(new Error(`Error during status check: ${error.message}`)) // Promise를 종료하고 에러 반환
              }
            }, interval)
          })
        },
      })
      asyncContextStorage.addOrder({ component: this.serviceName, method: "licenseVerification", state: "end" })
      return result
    } catch (error) {
      return this.handleServiceError({
        error,
        method: "licenseVerification",
        message: "[Interactive] - License 검증 중 오류 발생",
      })
    }
  }
}