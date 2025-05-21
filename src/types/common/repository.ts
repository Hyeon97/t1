////////////////////////////////
//  Repository 관련 타입 정의  //
////////////////////////////////

import { NON_SSH_REPOSITORY_VALUES, VALID_REPOSITORY_VALUES } from "./const-value"

/**
 * 작업 등록 또는 정보 수정 시 repository 입력 양식
 */
export interface RepositoryBody {
  //  repository id
  id?: number
  //  repository type
  type?: RepositoryTypeNonSSH
  //  repository path
  path?: string
}

/**
 * 일반적인 Repository 타입 정의
 */
export type AllRepositoryType = (typeof VALID_REPOSITORY_VALUES)[number]
export type RepositoryTypeNonSSH = (typeof NON_SSH_REPOSITORY_VALUES)[number]
export enum RepositoryEnum {
  SMB = 20,
  NFS = 21,
}
//  repository 타입 변환
export const RepositoryTypeMap = {
  // 문자열 → 숫자
  fromString: ({ str }: { str: string }): number => {
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
  toString: ({ value }: { value: number }): string => {
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
  fromString: ({ str }: { str: string }): number => {
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
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case RepositoryConnectionEnum.SMB:
        return "SMB"
      case RepositoryConnectionEnum.NFS:
        return "NFS"
      default:
        return "Unknown"
    }
  },

  // enum -> enum
  toEnum: ({ value }: { value: number }): RepositoryConnectionEnum => {
    switch (value) {
      case RepositoryEnum.SMB:
        return RepositoryConnectionEnum.SMB
      case RepositoryEnum.NFS:
        return RepositoryConnectionEnum.NFS
      default:
        throw new Error(`Unknown Repository Connection type: ${value}`)
    }
  },
}