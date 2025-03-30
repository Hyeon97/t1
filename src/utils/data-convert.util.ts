import { regNumberOnly } from "./regex.utils"

/**
 * 바이트 단위의 크기를 읽기 쉬운 형식으로 변환
 */
export const formatDiskSize = ({ sizeInBytes }: { sizeInBytes: string | number | undefined }): string => {
  // 입력값이 없거나 undefined인 경우 처리
  if (sizeInBytes === undefined || sizeInBytes === null || sizeInBytes === "") {
    return "Unknown"
  }

  try {
    // 문자열로 변환
    const sizeStr = String(sizeInBytes).trim()

    // 숫자로만 구성되어 있는지 확인
    if (!/^\d+$/.test(sizeStr)) {
      return typeof sizeInBytes === "string" ? sizeInBytes : "Invalid size"
    }

    const bytes = parseInt(sizeStr, 10)
    if (isNaN(bytes) || bytes === 0) {
      return typeof sizeInBytes === "string" ? sizeInBytes : "0 B"
    }

    const units = ["B", "KB", "MB", "GB", "TB", "PB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  } catch (error) {
    // 오류 발생 시 원본 문자열 반환 (문자열인 경우에만)
    return typeof sizeInBytes === "string" ? sizeInBytes : "Unknown"
  }
}

/**
 * 문자열을 숫자로 변환
 */
export const stringToNumber = ({ value }: { value: any }): any => {
  if (regNumberOnly.test(value)) {
    return Number(value)
  }
  return value
}

/**
 * 문자열을 boolean으로 변환
 */
export const stringToBoolean = ({ value }: { value: string | boolean | undefined | null }): boolean => {
  if (typeof value === "boolean") return value
  return value === "true"
}
