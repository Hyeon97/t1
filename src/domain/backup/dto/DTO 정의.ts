/**
 * [ Backup 관련 DTO 정의 ]
 *
 * [ Body ]
 *  - BackupRegistBodyDTO       : Backup 작업 등록 Body 정의
 *    - RepositoryDTO           : Backup 작업 등록시 Repository 입력 정의
 * 
 * [ Param ]
 *  - SpecificBackupGetParamDTO : 특정 Backup 작업 조회 파라미터 정의
 * 
 * [ Query ]
 *  - BackupDeleteQueryDTO      : 특정 Backup 작업 삭제 쿼리 옵션 정의
 *  - BackupGetQueryDTO         : Backup 작업 전체 조회 쿼리 옵션 정의
 *  - SpecificBackupGetQueryDTO : 특정 Backup 작업 조회 쿼리 옵션 정의 ( 기준 : id | name )
 * 
 * [ Response ]
 *  - BackupResponseBaseDTO     : Backup 작업 조회 결과 정의
 *  - BackupResponseDetailDTO   : Backup 작업 조회 상세 결과 정의
 */