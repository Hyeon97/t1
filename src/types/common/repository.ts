////////////////////////////////
//  Repository 관련 타입 정의  //
////////////////////////////////

import { VALID_REPOSITORY_VALUES } from "./const-value"

/**
 * 일반적인 Repository 타입 정의
 */
export type RepositoryType = (typeof VALID_REPOSITORY_VALUES)[number]
export enum RepositoryEnum {
  SMB = 20,
  NFS = 21,
}
//  repository 타입 변환
export const RepositoryTypeMap = {
  // 문자열 → 숫자
  fromString: (str: string): number => {
    const upperStr = str.toUpperCase()
    switch (upperStr) {
      case "SMB":
        return RepositoryEnum.SMB
      case "NFS":
        return RepositoryEnum.NFS
      default:
        throw new Error(`Unknown Repository type: ${str}`)
    }
  },

  // 숫자 → 문자열
  toString: (value: number): string => {
    switch (value) {
      case RepositoryEnum.SMB:
        return "SMB"
      case RepositoryEnum.NFS:
        return "NFS"
      default:
        return "Unknown"
    }
  },
}

/**
 * backup, recovery에서 repository 연결 타입 정의
 */
export type RepositoryConnectionType = (typeof VALID_REPOSITORY_VALUES)[number]
export enum RepositoryConnectionEnum {
  SMB = 1,
  NFS = 2,
}
//  repository 타입 변환
export const RepositoryConnectionTypeMap = {
  // 문자열 → 숫자
  fromString: (str: string): number => {
    const upperStr = str.toUpperCase()
    switch (upperStr) {
      case "SMB":
        return RepositoryConnectionEnum.SMB
      case "NFS":
        return RepositoryConnectionEnum.NFS
      default:
        throw new Error(`Unknown Repository Connection type: ${str}`)
    }
  },

  // 숫자 → 문자열
  toString: (value: number): string => {
    switch (value) {
      case RepositoryConnectionEnum.SMB:
        return "SMB"
      case RepositoryConnectionEnum.NFS:
        return "NFS"
      default:
        return "Unknown"
    }
  },
}