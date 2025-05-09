# API 문서: ZDM Portal API
- 마지막 수정: 2025-05-09
## 목차
- [인증 방식](#인증-방식)
- [공통 응답 형식](#공통-응답-형식)
- [Auth](#auth)
  - [Token 발급](#token-발급)
- [SERVER](#server)
  - [Server 조회](#server-조회)
  - [Server 삭제](#server-삭제)
- [CENTER - ZDM Portal ](#center---zdm-portal)
- [LICENSE](#license)
- [BACKUP](#backup)
  - [Backup 조회 - 전체](#backup-조회---전체)
  - [Backup 조회 - By Job ID](#backup-조회---by-job-id)
  - [Backup 조회 - By Job Name](#backup-조회---by-job-name)
  - [Backup 조회 - By Source Server Name](#backup-조회---by-source-server-name)
  - [Backup 수정 - By Job ID](#backup-수정---by-job-id)
  - [Backup 수정 - By Job Name](#backup-수정---by-job-name)
  - [Backup 삭제 - By Job ID](#backup-삭제---by-job-id)
  - [Backup 삭제 - By Job Name](#backup-삭제---by-job-name)
  - [Backup 모니터링 - By Job ID](#backup-모니터링---by-job-id)
  - [Backup 모니터링 - By Job Name](#backup-모니터링---by-job-name)
  - [Backup 모니터링 - By Source Server Name](#backup-모니터링---by-source-server-name)
- [SCHEDULE](#schedule)
- [진행 절차](#진행-절차)
  - [Backup 작업 등록](#backup-작업-등록)

## 기본 정보
- **Base URL**: `/api`
- **응답 형식**: JSON

# Auth
  ## Token 발급
  ### URL
  ```
  - http
  [POST] /api/token/issue

  - Curl
  curl --request POST 
  --url http://localhost:3000/api/token/issue 
  --header "Content-Type: application/json" 
  --data "{\"email\":\"test@zconverter.com\",\"password\":\"12345\"}"
  ```
    

  ### 설명
    API 사용을 위한 token을 발급받습니다.

  ### 요청 매개변수
  #### 헤더
    없음

  #### Parameter
    없음
  
  #### Query
    없음

  #### Body
  | 매개변수 | 타입 | 필수 여부 | 설명 |
  |--------|------|---------|------|
  | email | string | 필수 | ZDM Portal Login Email |
  | password | string | 필수 | ZDM Portal Login Password |

  ### 요청 예시

  ```json
  {
    "email": "test@zconverter.com",
    "password": "12345"
  }
  ```

  ### 응답 예시 ( 성공 )

  ```json
  {
    "requestID": "53ac9eb9-9006-444a-a23e-a404ff12eecb",
    "message": "Token이 성공적으로 발급되었습니다",
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWR4IjoxLCJlbWFpbCI6ImFkbWluQHpjb252ZXJ0ZXIuY29tIiwicGFzc3dvcmQiOiI2YzExMGE5ZWYyZTY3MWExYWJmMDBhMWFkNGY0MmNiYjY2OTExOWRiZjA0MTZhOTU3N2ExMDVjODA0ZDcwM2RjIiwiaWF0IjoxNzQ2Njg4NzY0LCJleHAiOjE3NDY2OTIzNjR9.PSaDjwu-vuduCA4D0Ag_WeLa-657EW1K1QGjUZHOX64"
    },
    "timestamp": "2025-05-08T07:19:24.739Z"
  }
  ```

  ### 응답 구조

  | 필드 | 타입 | 설명 |
  |------|------|------|
  | requestID | string | 요청 고유 ID |
  | message | string | 처리 결과 메시지 |
  | success | boolean | 요청 성공 여부 |
  | data.token | string | 발급된 JWT 토큰 |
  | timestamp | string | 요청 처리 시간 (ISO 8601 형식) |

  > **참고**: 발급된 토큰은 유효기간이 있으며, 이후 API 요청 시 인증 헤더에 포함해야 합니다.

  <details>
  <summary>토큰 구조 상세 정보</summary>

  발급된 JWT 토큰은 다음 정보를 포함합니다:
  - id: 사용자 ID
  - idx: 사용자 인덱스
  - email: 사용자 이메일
  - iat: 토큰 발급 시간
  - exp: 토큰 만료 시간

  </details>

  ### 응답 예시 ( 실패 )

  ```json
  {
    "requestID": "3e0e74f1-3feb-4e11-8988-4d1dfcc42263",
    "success": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Mail이 'admin@zcoverter.com'인 User를 찾을 수 없습니다",
      "details": {
        "cause": ""
      }
    },
    "timestamp": "2025-05-09T06:19:16.885Z"
  }
  ```

  ### 응답 구조

  | 필드 | 타입 | 설명 |
  |------|------|------|
  | requestID | string | 요청 고유 ID |
  | success | boolean | 요청 성공 여부 |
  | error.code | string | 에러 코드 |
  | error.message | string | 에러 메시지 |
  | timestamp | string | 요청 처리 시간 (ISO 8601 형식) |
  <br><br>

# SERVER
  ## Server 조회
  ### URL
  ```
  - http
  [GET] /api/servers

  - Curl
  curl --request GET
  --url http://localhost:3000/api/servers
  --header "Content-Type: application/json"
  --header "authorization: tokens"
  ```

  ### 설명
    ZDM Cetner에 등록된 Server 목록을 조회합니다.

  ### 요청 매개변수
  #### 헤더
  | 매개변수 | 타입 | 필수 여부 | 설명 |
  |--------|------|---------|------|
  | authorization | string | 필수 | 인증 token |

  #### Parameter
    없음

  #### Query
| 매개변수 | 타입 | 필수 여부 | 설명 | 기본값 | 예시 |
|--------|------|---------|------|-------|------|
| mode | string | 선택 | 조회할 server의 타입. `source`, `target`만 가능. | 전체 | `source` |
| os | string | 선택 | 조회할 server의 os 타입. `win`, `lin`만 가능. | 전체 | `lin` |
| connection | string | 선택 | 조회할 server의 zdm center와의 연결 상태. `connect`, `disconnect`만 가능. | 전체 | `connect` |
| license | string | 선택 | 조회할 server의 license 할당 상태. `assign`, `unassign`만 가능. | 전체 | `assign` |
| network | boolean | 선택 | 조회할 server의 network 추가정보 보이기. | `false` | `true` |
| disk | boolean | 선택 | 조회할 server의 disk 추가정보 보이기. | `false` | `true` |
| partition | boolean | 선택 | 조회할 server의 partition 추가정보 보이기. | `false` | `true` |
| repository | boolean | 선택 | 조회할 server의 repository 추가정보 보이기. | `false` | `true` |
| detail | boolean | 선택 | 조회할 server의 추가정보 보이기. | `false` | `true` |

  #### Body
    없음

  ### 요청 예시
  ```
  GET /api/servers?mode=source&network=true&disk=true
  ```

  ### 응답 예시 ( 성공 )

  ```json
  {
	  "requestID": "af55bd77-4cc4-4426-ba7b-1bba74d91fb5",
	  "message": "Server infomation list",
	  "success": true,
	  "data": [
	  	{
	  		"id": "28",
	  		"systemName": "rim-ubuntu24-uefi (192.168.1.12)",
	  		"systemMode": "source",
	  		"os": "Linux",
	  		"version": "Ubuntu 24.04 LTS, 6.8.0-45-generic",
	  		"ip": "218.145.120.34",
	  		"status": "disconnect",
	  		"licenseID": 74,
	  		"lastUpdated": "2025-05-07 11:46:20",
        "agent": "v7 build 7039",
			  "model": "VMware7,1",
			  "manufacturer": "VMware, Inc.",
			  "cpu": "Intel(R) Xeon(R) Silver 4216 CPU @ 2.10GHz",
			  "cpuCount": "1",
			  "memory": "2063138816 (1.92 GB)",
        "network": [
				  {
				  	"name": "ens160",
				  	"ipAddress": "192.168.1.12",
				  	"subNet": "255.255.252.0",
				  	"gateWay": "192.168.0.1",
				  	"macAddress": "00:50:56:a8:b8:8",
				  	"lastUpdated": "2024-11-11 20:44:15"
				  }
			  ],
			  "partition": [
			  	{
			  		"size": "10464022528 (9.75 GB)",
			  		"used": "5864058880 (5.46 GB)",
			  		"free": "4599963648 (4.28 GB)",
			  		"usage": "56.04%",
			  		"letter": "/",
			  		"device": "/dev/mapper/ubuntu--vg-ubuntu--lv",
			  		"fileSystem": "ext4",
			  		"lastUpdated": "2024-11-11 20:44:15"
			  	}
        ]    
	  	},
    ],
    "timestamp": "2025-05-08T07:19:24.739Z"
  }
  ```

  ### 응답 구조
  | 필드 | 타입 | 설명 |
  |------|------|------|
  | requestID | string | 요청 고유 ID |
  | message | string | 처리 결과 메시지 |
  | success | boolean | 요청 성공 여부 |
  | data | array | server 정보 배열 |
  | data[].id | string | 서버 ID |
  | data[].systemName | string | 서버 시스템명(IP) |
  | data[].systemMode | string | 서버 모드(source/target) |
  | data[].os | string | 운영체제 |
  | data[].version | string | OS 버전 정보 |
  | data[].ip | string | IP 주소 |
  | data[].status | string | 연결 상태 |
  | data[].licenseID | number | 할당된 라이선스 ID |
  | data[].lastUpdated | string | 마지막 업데이트 시간 |
  | data[].agent | string | 서버 agent version (`detail=true`) |
  | data[].model | string | 서버 model (`detail=true`) |
  | data[].manufacturer | string | 서버 manufacturer (`detail=true`) |
  | data[].cpu | string | 서버 cpu 정보 (`detail=true`) |
  | data[].cpuCount | string | 서버 cpu 갯수 (`detail=true`) |
  | data[].memory | string | 서버 memory size (`detail=true`) |
  | data[].network[].name | string | 서버 network 이름 (`network=true`) |
  | data[].network[].ipAddress | string | 서버 network IP address (`network=true`) |
  | data[].network[].subNet | string | 서버 network subnet marsk (`network=true`) |
  | data[].network[].gateWay | string | 서버 network gateway address (`network=true`) |
  | data[].network[].macAddress | string | 서버 mac address (`network=true`) |
  | data[].network[].lastUpdated | string | 서버 network 마지막 업데이트 시간 (`network=true`) |
  | data[].partition[].size | string | 서버 partition 전체 size (`partition=true`) |
  | data[].partition[].used | string | 서버 partition 사용중 size (`partition=true`) |
  | data[].partition[].free | string | 서버 partition 남은 size (`partition=true`) |
  | data[].partition[].usage | string | 서버 partition 사용율 (`partition=true`) |
  | data[].partition[].letter | string | 서버 partition 마운트 포인트 (`partition=true`) |
  | data[].partition[].device | string | 서버 partition 경로 (`partition=true`) |
  | data[].partition[].fileSystem | string | 서버 partition 파일 시스템 (`partition=true`) |
  | data[].partition[].lastUpdated | string | 서버 partition 마지막 업데이트 시간 (`partition=true`) |
  | timestamp | string | 요청 처리 시간 (ISO 8601 형식) |
  
  ## Server 삭제
<br><br>

# CENTER - ZDM Portal 
  ##  Cetner 조회
  ##  Cetner 삭제
  ##  Cetner repository 등록
  ##  Cetner repository 조회
  ##  Cetner repository 수정
  ##  Cetner repository 삭제
<br><br>

# LICENSE
  ## License 등록
  ## License 조회
  ## License 삭제
  ## License 할당
<br><br>

# BACKUP
  ##  Backup 등록
  ##  Backup 조회 - 전체
  ### URL
  ```
  - http
  [GET] /api/backups

  - Curl
  curl --request POST 
  --url http://localhost:3000/api/backups 
  --header "Content-Type: application/json" 
  --header "authorization: toknes"
  ```
  
  ### 설명
    ZDM Center에 등록된 Backup 작업을 전부 조회합니다.

  ### 요청 매개변수
  #### 헤더
    없음

  #### Parameter
    없음
  
  #### Query
  | 매개변수 | 타입 | 필수 여부 | 설명 |
  |--------|------|---------|------|
  | job-id | string | 필수 | ZDM Portal Login Email |

  #### Body
    없음

  ### 요청 예시

  ```json
  {
    "email": "test@zconverter.com",
    "password": "12345"
  }
  ```

  ### 응답 예시 ( 성공 )

  ```json
  {
    "requestID": "53ac9eb9-9006-444a-a23e-a404ff12eecb",
    "message": "Token이 성공적으로 발급되었습니다",
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWR4IjoxLCJlbWFpbCI6ImFkbWluQHpjb252ZXJ0ZXIuY29tIiwicGFzc3dvcmQiOiI2YzExMGE5ZWYyZTY3MWExYWJmMDBhMWFkNGY0MmNiYjY2OTExOWRiZjA0MTZhOTU3N2ExMDVjODA0ZDcwM2RjIiwiaWF0IjoxNzQ2Njg4NzY0LCJleHAiOjE3NDY2OTIzNjR9.PSaDjwu-vuduCA4D0Ag_WeLa-657EW1K1QGjUZHOX64"
    },
    "timestamp": "2025-05-08T07:19:24.739Z"
  }
  ```

  ### 응답 구조

  | 필드 | 타입 | 설명 |
  |------|------|------|
  | requestID | string | 요청 고유 ID |
  | message | string | 처리 결과 메시지 |
  | success | boolean | 요청 성공 여부 |
  | data.token | string | 발급된 JWT 토큰 |
  | timestamp | string | 요청 처리 시간 (ISO 8601 형식) |
  <br>

  ##  Backup 조회 - By Job ID
    ### URL
  ```
  - http
  [GET] /api/backups

  - Curl
  curl --request POST 
  --url http://localhost:3000/api/backups 
  --header "Content-Type: application/json" 
  --header "authorization: toknes"
  ```
  
  ### 설명
    ZDM Center에 등록된 Backup 작업을 전부 조회합니다.

  ### 요청 매개변수
  #### 헤더
    없음

  #### Parameter
    없음
  
  #### Query
    없음

  #### Body
  | 매개변수 | 타입 | 필수 여부 | 설명 |
  |--------|------|---------|------|
  | email | string | 필수 | ZDM Portal Login Email |
  | password | string | 필수 | ZDM Portal Login Password |
  <br>

  ##  Backup 조회 - By Job Name
  <br>

  ##  Backup 조회 - By Source Server Name
  <br>

  ##  Backup 수정 - By Job ID
  <br>

  ##  Backup 수정 - By Job Name
  <br>

  ##  Backup 삭제 - By Job ID
  <br>

  ##  Backup 삭제 - By Job Name
  <br>

  ##  Backup 모니터링 - By Job ID
  <br>

  ##  Backup 모니터링 - By Job Name
  <br>

  ##  Backup 모니터링 - By Source Server Name
  <br>

# SCHEDULE
  ##  Schedule 등록
  ##  Schedule 조회
  ##  Schedule 삭제
<br><br>

# 진행 절차
## Backup 작업 등록
```
Backup 작업 등록 절차
1.  Token 발급
2.  Server 목록 조회
  2-1.  Server Partition 목록 조회 ( Server의 모든 Partition 등록 할 경우에는 조회 팔요 없음 )
3.  License 목록 조회
  3-1.  License를 Server에 할당 ( Backup 작업 대상 Server에 할당 )
4.  ZDM Center 목록 조회
  4-1.  ZDM Center Repository 목록 조회
5.  Schedule 목록 조회 ( Schedule 신규 등록시에는 필요 없음 )
6.  Backup 작업 등록
```

## 인증 방식

API 토큰 발급 후, 이후 모든 API 요청에는 다음과 같은 인증 헤더를 포함해야 합니다:

```
authorization: {발급받은 토큰}
```

## 공통 응답 형식

모든 API 응답은 다음 구조를 따릅니다:

```json
{
  "requestID": "요청 고유 ID",
  "message": "처리 결과 메시지",
  "success": true/false,
  "data": { /* 응답 데이터 */ },
  "timestamp": "요청 처리 시간 (ISO 8601 형식)"
}
```

[ POST, GET ]         /api/backups
[ GET, DELETE, PUT ]  /api/backups/job-id/:jobId
[ GET, DELETE, PUT ]  /api/backups/job-name/:jobName
[ GET ]               /api/backups/server-name/:serverName
[ GET ]               /api/backups/job-id/:jobId/monitoring
[ GET ]               /api/backups/job-name/:jobName/monitoring
[ GET ]               /api/backups/server-name/:serverName/monitoring
[  ]                  /api/backups/job-id/:jobId/histories
[  ]                  /api/backups/job-name/:jobName/histories
[  ]                  /api/backups/server-name/:serverName/histories
[  ]                  /api/backups/job-id/:jobId/logs
[  ]                  /api/backups/job-name/:jobName/logs
[  ]                  /api/backups/server-name/:serverName/logs
[ GET, POST ]         /api/schedules