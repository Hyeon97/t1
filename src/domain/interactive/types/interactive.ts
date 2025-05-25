///////////////////////////////////////////////
//  job_interactive table 관련 인터페이스 정의 //
///////////////////////////////////////////////

import { JobInteractiveTable } from "./db/job_interactive"

/**
 * job_interactive table 작업 규정(job type) 정의
 */
export enum JobInteractiveTypeEnum {
  INTERACTIVE_REPOSITORYCONNECT_CHECK = 98,
  INTERACTIVE_CHECKPORT_NORMAL = 99, // 검증완료
  INTERACTIVE_CHECKPORT = 100,
  INTERACTIVE_GETBACKUPIMAGE = 101, // 검증완료
  INTERACTIVE_GETBACKUPIMAGE_REPOSITORY = 102, // 검증완료
  INTERACTIVE_REPOSITORYCONNECT = 103,
  INTERACTIVE_REPOSITORYINFORMATION = 104,
  INTERACTIVE_REMOTEFOLDER = 105,
  INTERACTIVE_OPENSTACK_VERIFY_ID = 106,
  INTERACTIVE_OPENSTACK_CREATEVOLUME = 107,
  INTERACTIVE_GETBACKUPIMAGE_REPOSITORY_1 = 110,
  INTERACTIVE_CHECK_DB = 300,
  INTERACTIVE_CHECK_ZCM = 301,
  INTERACTIVE_CHECK_REGISTER_ZCM = 302,
  INTERACTIVE_REGISTER_ZCM = 303,
  INTERACTIVE_SYNC_ZCM = 304,
  INTERACTIVE_DELETE_SQL = 305,
  INTERACTIVE_SYNC_ZCM_REP = 306, // 내 zcm 정보를 원격db에 전송하기
  INTERACTIVE_GETTIME_ZCM = 307, // zcm 서버 시간 받아오기
  INTERACTIVE_HEARTBEAT_SYSTEM = 308, // 서버 접속상태 확인하기
  INTERACTIVE_ZCM_TIMESTAMP = 309, // ZCM 시간 가져오기
  INTERACTIVE_REPOSITORYREGISTER = 310, // 저장소 등록하기
  INTERACTIVE_SENDMAIL = 311, // 이메일 전송하기
  INTERACTIVE_SCRIPTCOPY = 312, // 스크립트 파일 복사하기
  INTERACTIVE_SCRIPTCONTENTS = 313, // 스크립트 내용 전송하기
  INTERACTIVE_SENDMAIL_TEST = 314, // 이메일 전송하기(테스트)
  INTERACTIVE_UPDATE_SYSTEMINFO = 315, // 시스템 정보 업데이트(OS정보, 네트워크, 디스크)
  INTERACTIVE_UPDATE_DISKINFO = 316, // 디스크 정보 업데이트(디스크)
  INTERACTIVE_QUERY_FOLDER_INFO = 317, // 특정 볼륨이나 폴더 정보 가져오기
  INTERACTIVE_SMB_NAME_CHECK = 318, // 현재 SMB쪽 공유이름이 사용중인지 체크하기
  INTERACTIVE_NFS_NAME_CHECK = 319, // 현재 NFS쪽 공유이름이 사용중인지 체크하기
  INTERACTIVE_SMB_GETLIST = 320, // 현재 SMB쪽 전체 공유이름 목록 가져오기
  INTERACTIVE_NFS_GETLIST = 321, // 현재 NFS쪽 전체 공유이름 목록 가져오기
  INTERACTIVE_REPOSITORY_ADD = 322, // 저장소 추가하기
  INTERACTIVE_REPOSITORY_DELETE = 323, // 저장소 삭제하기
  INTERACTIVE_CHECK_LOCALPATH = 324, // 로컬 저장소 경로 존재하는지 확인
  INTERACTIVE_REPOSITORYINFORMATION_ZDM = 325, // ZDM 저장소 정보 업데이트
  INTERACTIVE_REPOSITORY_DATALIST = 326, // 저장소에 있는 파일 리스트 가져오기
  OCI_CLOUD_AUTH = 400, // oci 인증 확인
  OCI_BUCKET_LIST = 401, // oci bucket 리스트 가져오기
  OCI_BUCKET_REGISTER = 402, // oci bucket 등록
  OCI_BUCKET_INFO_UPDATE = 403, // oci bucket 정보 갱신
  OCI_BUCKET_OBJECTLIST = 404, // oci bucket 리스트 가져오기
  OCI_BUCKET_SET_IMMUTABLE = 405, // Oracle 계정에 있는 bucket에 immutable 설정하기
  INTERACTIVE_GCP_AUTH = 490, // GCP 인증 테스트
  INTERACTIVE_GCP_CLEANING = 491, // GCP 복구 후 GCP API를 이용하여 서버 종료 및 디스크 변경 작업
  INTERACTIVE_AWS_AUTH = 495, // AWS 인증 테스트
  JOBTYPE_ZOS_CMD_INFO = 503, // zos 커맨드 결과
  JOBTYPE_ZOS_GET_BUCKET = 504, // zos bucket 정보 가져오기
  JOBTYPE_ZOS_UPDATE_BUCKETINFO = 505, // zos bucket 정보 업데이트
  JOBTYPE_ZOS_GET_BUCKET_DIR = 506, // zos bucket 폴더 확인하기
  INTERACTIVE_ZOS_AUTH = 507, //Cloud Storage 접근인증 확인하기
  INTERACTIVE_ZOS_BUCKET_CHECK = 508, //Cloud Storage에 동일한이름의 bucket이 존재하는지 확인하기
  INTERACTIVE_ZOS_BUCKET_CREATE = 509, //Cloud Storage에 bucket 생성하기
  INTERACTIVE_ZOS_BUCKET_INFORMATION = 510, //Cloud Storage의 bucket에 대한 정보 확인하기
  INTERACTIVE_ZOS_BUCKET_BUCKET_DIR_LIST = 511, //Cloud Storage의 bucket안에 있는 폴더목록 확인하기
  INTERACTIVE_ZOS_BUCKET_BUCKET_LIST = 512, //Cloud Storage의 bucket 목록 확인하기
  INTERACTIVE_ZOS_BUCKET_BUCKET_DIR_CHECK = 513, //Cloud Storage의 bucket안에 특정 폴더가 존재하는지확인하기
  JOBTYPE_LICENSE_VALIDATION_STATUS = 598, // 라이센스 검증모드 활성화 상태체크하기
  JOBTYPE_LICENSE_VALIDATION_CHECK = 599, // 라이센스 검증모드 활성화/비활성화하기
  JOBTYPE_LICENSE_CREATE = 600, // 라이센스키 생성하기
  JOBTYPE_LICENSE_SYNC = 601, // 라이센스키 정보 동기화
  JOBTYPE_LICENSE_ADD = 602, // 라이센스키 등록하기
  JOBTYPE_LICENSE_ASSIGN_ADMIN = 603, // 라이센스키 할당하기(ADMIN페이지)
  JOBTYPE_LICENSE_RECLAIM_ADMIN = 604, // 라이센스키 회수하기(ADMIN페이지)
  JOBTYPE_RSYNC_CMD_INFO = 605, // rsync 커맨드 결과
  JOBTYPE_RSYNC_BUCKETNAME_CHECK = 606, // cloud bucket 존재 체크
  JOBTYPE_RSYNC_CREATE_BUCKET = 607, // cloud bucket 생성
  JOBTYPE_RSYNC_LIST_BUCKET = 608, // cloud bucket 리스트
  JOBTYPE_RSYNC_BUCKET_SIZE = 609, // cloud bucket 크기
  JOBTYPE_RSYNC_BUCKET_LIST_DIR = 610, // cloud bucket 내에 폴더리스트 조회
  JOBTYPE_CMD_INFO = 700, // cmd 결과 확인
}

/**
 * job_interactive table 작업진행 상태 관련
 */
//  job_interactive 작업 진행상태 정의
export type JobInteractiveStatus = "running" | "completed" | "waiting" | "error"
export enum JobInteractiveStatusEnum {
  ERROR = 0,
  RUNNING = 1,
  COMPLETED = 2,
  WAITING = 3,
}
//  job_interactive 작업 진행상태 변환
export const JobInteractiveStatusMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "running":
        return JobInteractiveStatusEnum.RUNNING
      case "completed":
        return JobInteractiveStatusEnum.COMPLETED
      case "waiting":
        return JobInteractiveStatusEnum.WAITING
      default:
        return JobInteractiveStatusEnum.ERROR
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case JobInteractiveStatusEnum.RUNNING:
        return "Running"
      case JobInteractiveStatusEnum.COMPLETED:
        return "Completed"
      case JobInteractiveStatusEnum.WAITING:
        return "Waiting"
      default:
        return "Error"
    }
  },
}

/**
 * job_interactive table license 검증 disable/enable 용
 */
export type JobInteractiveLicenseVerificationMode = "disable" | "enable"
export enum JobInteractiveLicenseVerificationModeEnum {
  DISABLE = 0,
  ENABLE = 1,
}
export const JobInteractiveLicenseVerificationMap = {
  fromString: ({ str }: { str: string }): number => {
    const lowerStr = str.toLowerCase()
    switch (lowerStr) {
      case "disable":
        return JobInteractiveLicenseVerificationModeEnum.DISABLE
      case "enable":
        return JobInteractiveLicenseVerificationModeEnum.ENABLE
      default:
        throw new Error(`Invalid license verification mode: ${str}`)
    }
  },
  toString: ({ value }: { value: number }): string => {
    switch (value) {
      case JobInteractiveLicenseVerificationModeEnum.DISABLE:
        return "disable"
      case JobInteractiveLicenseVerificationModeEnum.ENABLE:
        return "enable"
      default:
        return "Error"
    }
  },
}

/**
 * job_interactive table license 검증 disable/enable input 객체
 */
export type JobInteractiveLicenseVerificationInput = Pick<
  JobInteractiveTable,
  "nGroupID" | "nUserID" | "nCenterID" | "nRequestID" | "sSystemName" | "nJobType" | "nJobStatus" | "sJobData"
>

/**
 * job_interactive table 필터 옵션
 */
export interface JobInteractiveFilterOptions {
  centerID?: number
  systemName?: string
  requestID?: number
  jobType?: number
  jobStatus?: number
}
