# API Documentation: ZDM Portal API

- Last updated: 2025-05-09
- server 조회 옵션 repository 동작안함
- backup 작업 필터링 status, result 추가 필요

## Table of Contents

- [Authentication Method](#authentication-method)
- [Common Response Format](#common-response-format)
- [Auth](#auth)
  - [Token Issuance](#token-issuance)
- [Server](#server)
  - [Server List Retrieval](#server-list-retrieval)
  - [Server Deletion](#server-deletion)
- [Center - ZDM Portal](#center---zdm-portal)
- [License](#license)
- [Backup](#backup)
  - [Backup Job Retrieval - All](#backup-job-retrieval---all)
  - [Backup Job Retrieval - By Job ID](#backup-job-retrieval---by-job-id)
  - [Backup Job Retrieval - By Job Name](#backup-job-retrieval---by-job-name)
  - [Backup Job Retrieval - By Source Server Name](#backup-job-retrieval---by-source-server-name)
  - [Backup Job Modification - By Job ID](#backup-job-modification---by-job-id)
  - [Backup Job Modification - By Job Name](#backup-job-modification---by-job-name)
  - [Backup Job Deletion - By Job ID](#backup-job-deletion---by-job-id)
  - [Backup Job Deletion - By Job Name](#backup-job-deletion---by-job-name)
  - [Backup Job Monitoring - By Job ID](#backup-job-monitoring---by-job-id)
  - [Backup Job Monitoring - By Job Name](#backup-job-monitoring---by-job-name)
  - [Backup Job Monitoring - By Source Server Name](#backup-job-monitoring---by-source-server-name)
- [Schedule](#schedule)
- [Process Flow](#process-flow)
  - [Backup Job Registration](#backup-job-registration)

## Basic Information

- **Base URL**: `/api`
- **Response Format**: JSON

# Auth

## Token Issuance

### Description

```txt
Obtain a token for API usage.
```

### URL

```txt
- http
[POST] /api/token/issue

- Curl
curl --request POST
--url http://localhost:3000/api/token/issue
--header "Content-Type: application/json"
--data "{\"email\":\"test@zconverter.com\",\"password\":\"12345\"}"
```

### Request Parameters

#### Headers

```txt
None
```

#### Parameter

```txt
None
```

#### Query

```txt
None
```

#### Body

| Parameter | Type   | Required | Description                | Default | Example             |
| --------- | ------ | -------- | -------------------------- | ------- | ------------------- |
| email     | string | Required | ZDM Portal Login Email.    |         | test@zconverter.com |
| password  | string | Required | ZDM Portal Login Password. |         | 12345               |

### Request Example

```json
{
  "email": "test@zconverter.com",
  "password": "12345"
}
```

### Response Example (Success)

```json
{
  "requestID": "53ac9eb9-9006-444a-a23e-a404ff12eecb",
  "message": "Token has been successfully issued",
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWR4IjoxLCJlbWFpbCI6ImFkbWluQHpjb252ZXJ0ZXIuY29tIiwicGFzc3dvcmQiOiI2YzExMGE5ZWYyZTY3MWExYWJmMDBhMWFkNGY0MmNiYjY2OTExOWRiZjA0MTZhOTU3N2ExMDVjODA0ZDcwM2RjIiwiaWF0IjoxNzQ2Njg4NzY0LCJleHAiOjE3NDY2OTIzNjR9.PSaDjwu-vuduCA4D0Ag_WeLa-657EW1K1QGjUZHOX64"
  },
  "timestamp": "2025-05-08T07:19:24.739Z"
}
```

### Response Structure

| Field      | Type    | Description                                |
| ---------- | ------- | ------------------------------------------ |
| requestID  | string  | Request unique ID.                         |
| message    | string  | Processing result message.                 |
| success    | boolean | Request success status.                    |
| data.token | string  | Issued JWT token.                          |
| timestamp  | string  | Request processing time. (ISO 8601 format) |

> **Note**: The issued token has an expiration period and must be included in the authentication header for subsequent API requests.

  <details>
  <summary>Token Structure Details</summary>

The issued JWT token includes the following information:

- id: User ID
- idx: User index
- email: User email
- iat: Token issuance time
- exp: Token expiration time

  </details>

### Response Example (Failure)

```json
{
  "requestID": "3e0e74f1-3feb-4e11-8988-4d1dfcc42263",
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User with email 'admin@zcoverter.com' could not be found",
    "details": {
      "cause": ""
    }
  },
  "timestamp": "2025-05-09T06:19:16.885Z"
}
```

### Response Structure

| Field         | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| requestID     | string  | Request unique ID.                         |
| success       | boolean | Request success status.                    |
| error.code    | string  | Error code.                                |
| error.message | string  | Error message.                             |
| timestamp     | string  | Request processing time. (ISO 8601 format) |

<br><br>

# Server

## Server List Retrieval

### Description

```txt
Retrieval the list of Servers registered to the ZDM Center.
```

### URL

```txt
- http
[GET] /api/servers

- Curl
curl --request GET
--url http://localhost:3000/api/servers
--header "Content-Type: application/json"
--header "authorization: tokens"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

```txt
None
```

#### Query

| Parameter  | Type    | Required | Description                                                              | Default | Example   |
| ---------- | ------- | -------- | ------------------------------------------------------------------------ | ------- | --------- |
| mode       | string  | Optional | Type of server to query. Only `source`, `target` are allowed.            | All     | `source`  |
| os         | string  | Optional | OS type of server to query. Only `win`, `lin` are allowed.               | All     | `lin`     |
| connection | string  | Optional | Connection status with zdm center. Only `connect`, `disconnect` allowed. | All     | `connect` |
| license    | string  | Optional | Server license assignment status. Only `assign`, `unassign` allowed.     | All     | `assign`  |
| network    | boolean | Optional | Show server network additional information.                              | `false` | `true`    |
| disk       | boolean | Optional | Show server disk additional information.                                 | `false` | `true`    |
| partition  | boolean | Optional | Show server partition additional information.                            | `false` | `true`    |
| repository | boolean | Optional | Show server repository additional information.                           | `false` | `true`    |
| detail     | boolean | Optional | Show server additional information.                                      | `false` | `true`    |

#### Body

```txt
None
```

### Request Example

```txt
- Show all additional information
[GET] /api/servers?disk=true&network=true&partition=true&repository=true&detail=true

- Retrieval only target servers
[GET] /api/servers?mode=target

- Retrieval only Windows servers
[GET] /api/servers?os=win

- Retrieval only servers connected to the center
[GET] /api/servers?connection=connect

- Retrieval only servers without license assignment
[GET] /api/servers?license=unassign
```

### Response Example (Success)

```json
{
  "requestID": "af55bd77-4cc4-4426-ba7b-1bba74d91fb5",
  "message": "Server information list",
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
    }
  ],
  "timestamp": "2025-05-08T07:19:24.739Z"
}
```

### Response Structure

| Field                          | Type    | Description                                           |
| ------------------------------ | ------- | ----------------------------------------------------- |
| requestID                      | string  | Request unique ID.                                    |
| message                        | string  | Processing result message.                            |
| success                        | boolean | Request success status.                               |
| data                           | array   | Server information array.                             |
| data[].id                      | string  | Server ID.                                            |
| data[].systemName              | string  | Server system name (IP).                              |
| data[].systemMode              | string  | Server mode (source/target).                          |
| data[].os                      | string  | Operating system.                                     |
| data[].version                 | string  | OS version information.                               |
| data[].ip                      | string  | IP address.                                           |
| data[].status                  | string  | Connection status.                                    |
| data[].licenseID               | string  | Assigned license ID.                                  |
| data[].lastUpdated             | string  | Last update time.                                     |
| data[].agent                   | string  | Server agent version. (`detail=true`)                 |
| data[].model                   | string  | Server model. (`detail=true`)                         |
| data[].manufacturer            | string  | Server manufacturer. (`detail=true`)                  |
| data[].cpu                     | string  | Server CPU information. (`detail=true`)               |
| data[].cpuCount                | string  | Server CPU count. (`detail=true`)                     |
| data[].memory                  | string  | Server memory size. (`detail=true`)                   |
| data[].network[].name          | string  | Server network name. (`network=true`)                 |
| data[].network[].ipAddress     | string  | Server network IP address. (`network=true`)           |
| data[].network[].subNet        | string  | Server network subnet mask. (`network=true`)          |
| data[].network[].gateWay       | string  | Server network gateway address. (`network=true`)      |
| data[].network[].macAddress    | string  | Server MAC address. (`network=true`)                  |
| data[].network[].lastUpdated   | string  | Server network last update time. (`network=true`)     |
| data[].partition[].size        | string  | Server partition total size. (`partition=true`)       |
| data[].partition[].used        | string  | Server partition used size. (`partition=true`)        |
| data[].partition[].free        | string  | Server partition free size. (`partition=true`)        |
| data[].partition[].usage       | string  | Server partition usage rate. (`partition=true`)       |
| data[].partition[].letter      | string  | Server partition mount point. (`partition=true`)      |
| data[].partition[].device      | string  | Server partition path. (`partition=true`)             |
| data[].partition[].fileSystem  | string  | Server partition file system. (`partition=true`)      |
| data[].partition[].lastUpdated | string  | Server partition last update time. (`partition=true`) |
| timestamp                      | string  | Request processing time. (ISO 8601 format)            |

## Server Deletion

<br><br>

# Center - ZDM Portal

## Center Retrieval

## Center Deletion

## Center Repository Registration

## Center Repository Retrieval

## Center Repository Modification

## Center Repository Deletion

<br><br>

# License

## License Registration

## License Retrieval

## License Deletion

## License Assignment

<br><br>

# Backup

## Backup Registration

### Description

```txt
Registers a new Backup Job with the ZDM Center.
```

### URL

```txt
- http
[POST] /api/backups

- Curl
curl --request POST
--url http://localhost:3000/api/backups
--header "Content-Type: application/json"
--header "authorization: tokens"
--data "{/* JSON Data */}"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

```txt
None
```

#### Query

```txt
None
```

#### Body

요청하신 내용대로 Body 표를 수정했습니다:

| Parameter                     | Type             | Required | Description                                                                                                                                | Default        | Example                                                       |
| ----------------------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------- |
| center                        | string           | Required | Center ID (numeric) or Center name (string).                                                                                               | -              | "123" or "Main Center"                                        |
| server                        | string           | Required | Job server ID (numeric) or server name (string).                                                                                           | -              | "456" or "source-server-01"                                   |
| type                          | string           | Required | Job type. (Only `full`, `inc`, `smart` are allowed.)                                                                                       | -              | `full`                                                        |
| partition                     | string[]         | Required | Job partitions. (If omitted, all partitions will be registered.)                                                                           | All partitions | ["/", "/test", "/test2"]                                      |
| repository                    | object           | Required | Repository to be used for the job.                                                                                                         | -              | see below                                                     |
| repository.id                 | string           | Required | Repository ID.                                                                                                                             | -              | "789"                                                         |
| repository.type               | string           | Optional | Repository type.(Only `smb`, `nfs` are allowed.)                                                                                           | -              | `smb`                                                         |
| repository.path               | string           | Optional | Repository path.                                                                                                                           | -              | `smb`: \\\\127.0.0.1\\ZConverter `nfs`: 127.0.0.1:/ZConverter |
| jobName                       | string           | Optional | Job name.                                                                                                                                  | -              | "Daily-DB-Backup"                                             |
| user                          | string           | Optional | User ID (numeric) or user email (string).                                                                                                  | -              | "101" or "admin@example.com"                                  |
| schedule                      | object           | Optional | Schedule to be used for the job. For `full` or `inc` type, use only relevant key. For `smart` type, both `full` and `inc` must be present. | -              | see below                                                     |
| schedule.type                 | string           | Optional | Schedule type. (`0-6` for `full` and `inc`, `7-11` for `smart`)                                                                            | -              | "5"                                                           |
| schedule.full                 | string or object | Optional | Registered schedule ID (numeric) or new schedule configuration.                                                                            | -              | "202" or see below                                            |
| schedule.full.year            | string           | Optional | Year configuration. Must be in `YYYY` format. (varies by schedule type.)                                                                   | -              | "2025"                                                        |
| schedule.full.month           | string           | Optional | Month configuration. Values from `1 to 12` only. (varies by schedule type.)                                                                | -              | "1,3,5,7,9,11"                                                |
| schedule.full.week            | string           | Optional | Week configuration. Values from `1 to 5` only. (varies by schedule type.)                                                                  | -              | "0,3,6"                                                       |
| schedule.full.day             | string           | Optional | Day configuration. Values from `1 to 31` only. (varies by schedule type.)                                                                  | -              | "1,15" or "mon, sat, sun"                                     |
| schedule.full.time            | string           | Optional | Time configuration. Must be in `HH:MM` format (00:00 - 24:00). (varies by schedule type.)                                                  | -              | "02:00"                                                       |
| schedule.full.interval.hour   | string           | Optional | Hour interval. (varies by schedule type.)                                                                                                  | -              | "4"                                                           |
| schedule.full.interval.minute | string           | Optional | Minute interval. (varies by schedule type.)                                                                                                | -              | "30"                                                          |
| schedule.increment            | string or object | Optional | Same structure as schedule.full but for incremental backup.                                                                                | -              | Same structure as schedule.full                               |
| description                   | string           | Optional | Additional description.                                                                                                                    | ""             | "Weekly system backup"                                        |
| rotation                      | string           | Optional | Number of job repetitions. `(1-31)`                                                                                                        | "1"            | "7"                                                           |
| compression                   | string           | Optional | Whether to use compression for the job.                                                                                                    | "use"          | "use" or "not use"                                            |
| encryption                    | string           | Optional | Whether to use encryption for the job.                                                                                                     | "not use"      | "use" or "not use"                                            |
| excludeDir                    | string           | Optional | Directories to exclude from the job, separated by `\|`.                                                                                    | ""             | "dir1\|dir2\|dir3"                                            |
| excludePartition              | string           | Optional | Partitions to exclude from the job, separated by `\|`.                                                                                     | ""             | "/\|/test\|/test2"                                            |
| mailEvent                     | string           | Optional | Email to receive job event notifications.                                                                                                  | user value     | "alerts@example.com"                                          |
| networkLimit                  | string           | Optional | Job network speed limit.                                                                                                                   | Unlimited      | "100"                                                         |
| autoStart                     | string           | Optional | Whether to start automatically.                                                                                                            | "not use"      | "use" or "not use"                                            |

```json
- ex)
{
  "center": 6 | "zdm-center",
  "server": 28 | "source-server-v1",
  "type": "full",
  "partition": [] | ["/", "/test"],
  "repository": {
    "id": 16,
    "type":"smb",
    "path":"\\\\127.0.0.1\\ZConverter",
  },
  "schedule": {
    "full": {
      "year": "",
      "month": "4",
      "week": "1",
      "day": "mon",
      "time": "12:00",
      "interval": {
        "minute": "",
        "hour": ""
      }
    },
    "increment": {
      "year": "",
      "month": "4,6",
      "week": "1,3",
      "day": "mon,tue,wed,thu",
      "time": "12:00",
      "interval": {
        "minute": "",
        "hour": ""
      }
    }
  }
}
```

### Request Example

```txt
- Retrieval all jobs
[GET] /api/backups

- Retrieval all jobs including additional information
[GET] /api/backups?detail=true

- Retrieval only Increment Backup jobs
[GET] /api/backups?mode=inc

- Retrieval only jobs for /test partition
[GET] /api/backups?partition=/test

- Retrieval jobs using specific repository - by ID
[GET] /api/backups?repositoryID=12

- Retrieval jobs using specific repository - by path
[GET] /api/backups?repositoryPath=\\\\127.0.0.1\\ZConverter

- Retrieval jobs by repository type
[GET] /api/backups?repositoryType=nfs
```

### Response Example (Success)

```json
{
  "requestID": "f122e6ce-652d-412e-a099-cb2212f340e6",
  "message": "Backup information list",
  "success": true,
  "data": [
    {
      "id": "22",
      "jobName": "rim-centos7-bios_ROOT",
      "systemName": "rim-centos7-bios (192.168.0.134)",
      "partition": "/",
      "mode": "Full Backup",
      "result": "COMPLETE",
      "schedule": {
        "basic": "-",
        "advanced": "-"
      },
      "repository": {
        "id": "16",
        "type": "SMB",
        "path": "\\\\192.168.1.93\\zconverter"
      },
      "option": {
        "rotation": "1",
        "excludeDir": "-",
        "compression": "Use",
        "encryption": "Use"
      },
      "timestamp": {
        "start": "2024-12-18T20:32:27.000Z",
        "end": "2024-12-19 05:34:51",
        "elapsed": "0 day, 00:02:24"
      },
      "lastUpdate": "2024-12-18T20:34:51.000Z"
    }
  ]
}
```

### Response Structure

| Field                     | Type    | Description                                   |
| ------------------------- | ------- | --------------------------------------------- |
| requestID                 | string  | Request unique ID.                            |
| message                   | string  | Processing result message.                    |
| success                   | boolean | Request success status.                       |
| data[].id                 | string  | Job ID.                                       |
| data[].jobName            | string  | Job Name.                                     |
| data[].systemName         | string  | Source Server Name.                           |
| data[].partition          | string  | Source Server Partition.                      |
| data[].mode               | string  | Job Mode.                                     |
| data[].result             | string  | Job Result.                                   |
| data[].schedule.basic     | string  | Schedule ID.                                  |
| data[].schedule.advanced  | string  | Additional Schedule ID.                       |
| data[].repository.id      | string  | Center Repository ID.                         |
| data[].repository.type    | string  | Center Repository Type.                       |
| data[].repository.path    | string  | Center Repository Path.                       |
| data[].option.rotation    | string  | Number of Job iterations. (`detail=true`)     |
| data[].option.excludeDir  | string  | Job exclusion directory. (`detail=true`)      |
| data[].option.compression | string  | Whether to compress Job data. (`detail=true`) |
| data[].option.encryption  | string  | Whether to encrypt Job data. (`detail=true`)  |
| data[].timestamp.start    | string  | Job Start Time.                               |
| data[].timestamp.end      | string  | Job End Time.                                 |
| data[].timestamp.elapsed  | string  | Job Elapsed Time.                             |
| timestamp                 | string  | Request processing time. (ISO 8601 format)    |

<br>

## Backup Job Retrieval - All

### URL

```txt
- http
[GET] /api/backups

- Curl
curl --request GET
--url http://localhost:3000/api/backups
--header "Content-Type: application/json"
--header "authorization: tokens"
```

### Description

```txt
Retrieval all Backup jobs registered to the ZDM Center.
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

```txt
None
```

#### Query

| Parameter      | Type    | Required | Description                                                                      | Default | Example                                                       |
| -------------- | ------- | -------- | -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| mode           | string  | Optional | Backup job mode. (Only `full`, `inc`, `smart` allowed.)                          |         | `full`                                                        |
| partition      | string  | Optional | Backup job target partition. (Currently only single partition query is possible) |         | partition="/test"                                             |
| status         | string  | Optional | Backup job status.                                                               |         |                                                               |
| result         | string  | Optional | Backup job result.                                                               |         |                                                               |
| repositoryID   | string  | Optional | ZDM Repository ID used for Backup job.                                           |         |                                                               |
| repositoryType | string  | Optional | ZDM Repository Type used for Backup job. (Only `smb`, `nfs` allowed.)            |         | `smb`                                                         |
| repositoryPath | string  | Optional | ZDM Repository Path used for Backup job.                                         |         | `smb`: \\\\127.0.0.1\\ZConverter `nfs`: 127.0.0.1:/ZConverter |
| detail         | boolean | Optional | Show Backup job detailed information.                                            | false   |                                                               |

#### Body

```txt
None
```

### Request Example

```txt
- Retrieval all jobs
[GET] /api/backups

- Retrieval all jobs including additional information
[GET] /api/backups?detail=true

- Retrieval only Increment Backup jobs
[GET] /api/backups?mode=inc

- Retrieval only jobs for /test partition
[GET] /api/backups?partition=/test

- Retrieval jobs using specific repository - by ID
[GET] /api/backups?repositoryID=12

- Retrieval jobs using specific repository - by path
[GET] /api/backups?repositoryPath=\\\\127.0.0.1\\ZConverter

- Retrieval jobs by repository type
[GET] /api/backups?repositoryType=nfs
```

### Response Example (Success)

```json
{
  "requestID": "f122e6ce-652d-412e-a099-cb2212f340e6",
  "message": "Backup information list",
  "success": true,
  "data": [
    {
      "id": "22",
      "jobName": "rim-centos7-bios_ROOT",
      "systemName": "rim-centos7-bios (192.168.0.134)",
      "partition": "/",
      "mode": "Full Backup",
      "result": "COMPLETE",
      "schedule": {
        "basic": "-",
        "advanced": "-"
      },
      "repository": {
        "id": "16",
        "type": "SMB",
        "path": "\\\\192.168.1.93\\zconverter"
      },
      "option": {
        "rotation": "1",
        "excludeDir": "-",
        "compression": "Use",
        "encryption": "Use"
      },
      "timestamp": {
        "start": "2024-12-18T20:32:27.000Z",
        "end": "2024-12-19 05:34:51",
        "elapsed": "0 day, 00:02:24"
      },
      "lastUpdate": "2024-12-18T20:34:51.000Z"
    }
  ]
}
```

### Response Structure

| Field                     | Type    | Description                                   |
| ------------------------- | ------- | --------------------------------------------- |
| requestID                 | string  | Request unique ID.                            |
| message                   | string  | Processing result message.                    |
| success                   | boolean | Request success status.                       |
| data[].id                 | string  | Job ID.                                       |
| data[].jobName            | string  | Job Name.                                     |
| data[].systemName         | string  | Source Server Name.                           |
| data[].partition          | string  | Source Server Partition.                      |
| data[].mode               | string  | Job Mode.                                     |
| data[].result             | string  | Job Result.                                   |
| data[].schedule.basic     | string  | Schedule ID.                                  |
| data[].schedule.advanced  | string  | Additional Schedule ID.                       |
| data[].repository.id      | string  | Center Repository ID.                         |
| data[].repository.type    | string  | Center Repository Type.                       |
| data[].repository.path    | string  | Center Repository Path.                       |
| data[].option.rotation    | string  | Number of Job iterations. (`detail=true`)     |
| data[].option.excludeDir  | string  | Job exclusion directory. (`detail=true`)      |
| data[].option.compression | string  | Whether to compress Job data. (`detail=true`) |
| data[].option.encryption  | string  | Whether to encrypt Job data. (`detail=true`)  |
| data[].timestamp.start    | string  | Job Start Time.                               |
| data[].timestamp.end      | string  | Job End Time.                                 |
| data[].timestamp.elapsed  | string  | Job Elapsed Time.                             |
| timestamp                 | string  | Request processing time. (ISO 8601 format)    |

<br>

## Backup Job Retrieval - By Job ID

### Description

```txt
Retrieval all Backup jobs registered to the ZDM Center.
```

### URL

```txt
- http
[GET] /api/backups/job-id/:jobId

- Curl
curl --request GET
--url http://localhost:3000/api/backups/job-id/{jobID}
--header "Content-Type: application/json"
--header "authorization: tokens"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| jobID | string | Required | The unique ID of the backup job to be retrieved. |         | 12   |

#### Query

| Parameter      | Type    | Required | Description                                                                      | Default | Example                                                       |
| -------------- | ------- | -------- | -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------- |
| mode           | string  | Optional | Backup job mode. (Only `full`, `inc`, `smart` allowed.)                          |         | `full`                                                        |
| partition      | string  | Optional | Backup job target partition. (Currently only single partition query is possible) |         | partition="/test"                                             |
| status         | string  | Optional | Backup job status.                                                               |         |                                                               |
| result         | string  | Optional | Backup job result.                                                               |         |                                                               |
| repositoryID   | string  | Optional | ZDM Repository ID used for Backup job.                                           |         |                                                               |
| repositoryType | string  | Optional | ZDM Repository Type used for Backup job. (Only `smb`, `nfs` allowed.)            |         | `smb`                                                         |
| repositoryPath | string  | Optional | ZDM Repository Path used for Backup job.                                         |         | `smb`: \\\\127.0.0.1\\ZConverter `nfs`: 127.0.0.1:/ZConverter |
| detail         | boolean | Optional | Show Backup job detailed information.                                            | false   |                                                               |

#### Body

```txt
None
```

### Request Example

```txt
- Retrieval all jobs
[GET] /api/backups

- Retrieval all jobs including additional information
[GET] /api/backups?detail=true

- Retrieval only Increment Backup jobs
[GET] /api/backups?mode=inc

- Retrieval only jobs for /test partition
[GET] /api/backups?partition=/test

- Retrieval jobs using specific repository - by ID
[GET] /api/backups?repositoryID=12

- Retrieval jobs using specific repository - by path
[GET] /api/backups?repositoryPath=\\\\127.0.0.1\\ZConverter

- Retrieval jobs by repository type
[GET] /api/backups?repositoryType=nfs
```

### Response Example (Success)

```json
{
  "requestID": "f122e6ce-652d-412e-a099-cb2212f340e6",
  "message": "Backup information list",
  "success": true,
  "data": [
    {
      "id": "22",
      "jobName": "rim-centos7-bios_ROOT",
      "systemName": "rim-centos7-bios (192.168.0.134)",
      "partition": "/",
      "mode": "Full Backup",
      "result": "COMPLETE",
      "schedule": {
        "basic": "-",
        "advanced": "-"
      },
      "repository": {
        "id": "16",
        "type": "SMB",
        "path": "\\\\192.168.1.93\\zconverter"
      },
      "option": {
        "rotation": "1",
        "excludeDir": "-",
        "compression": "Use",
        "encryption": "Use"
      },
      "timestamp": {
        "start": "2024-12-18T20:32:27.000Z",
        "end": "2024-12-19 05:34:51",
        "elapsed": "0 day, 00:02:24"
      },
      "lastUpdate": "2024-12-18T20:34:51.000Z"
    }
  ]
}
```

### Response Structure

| Field                     | Type    | Description                                   |
| ------------------------- | ------- | --------------------------------------------- |
| requestID                 | string  | Request unique ID.                            |
| message                   | string  | Processing result message.                    |
| success                   | boolean | Request success status.                       |
| data[].id                 | string  | Job ID.                                       |
| data[].jobName            | string  | Job Name.                                     |
| data[].systemName         | string  | Source Server Name.                           |
| data[].partition          | string  | Source Server Partition.                      |
| data[].mode               | string  | Job Mode.                                     |
| data[].result             | string  | Job Result.                                   |
| data[].schedule.basic     | string  | Schedule ID.                                  |
| data[].schedule.advanced  | string  | Additional Schedule ID.                       |
| data[].repository.id      | string  | Center Repository ID.                         |
| data[].repository.type    | string  | Center Repository Type.                       |
| data[].repository.path    | string  | Center Repository Path.                       |
| data[].option.rotation    | string  | Number of Job iterations. (`detail=true`)     |
| data[].option.excludeDir  | string  | Job exclusion directory. (`detail=true`)      |
| data[].option.compression | string  | Whether to compress Job data. (`detail=true`) |
| data[].option.encryption  | string  | Whether to encrypt Job data. (`detail=true`)  |
| data[].timestamp.start    | string  | Job Start Time.                               |
| data[].timestamp.end      | string  | Job End Time.                                 |
| data[].timestamp.elapsed  | string  | Job Elapsed Time.                             |
| timestamp                 | string  | Request processing time. (ISO 8601 format)    |

<br>

## Backup Job Retrieval - By Job Name

<br>

## Backup Job Retrieval - By Source Server Name

<br>

## Backup Job Modification - By Job ID

<br>

## Backup Job Modification - By Job Name

<br>

## Backup Job Deletion - By Job ID

<br>

## Backup Job Deletion - By Job Name

<br>

## Backup Job Monitoring - By Job ID

<br>

## Backup Job Monitoring - By Job Name

<br>

## Backup Job Monitoring - By Source Server Name

<br>

# Schedule

## Schedule Registration

## Schedule Retrieval

## Schedule Deletion

<br><br>

# Process Flow

## Backup Job Registration

```txt
Backup Job Registration Procedure
1.  Token Issuance
2.  Server List Retrieval
  2-1.  Server Partition List Retrieval (Not needed if registering all partitions of the Server)
3.  License List Retrieval
  3-1.  License Assignment to Server (Assigned to Backup job target Server)
4.  ZDM Center List Retrieval
  4-1.  ZDM Center Repository List Retrieval
5.  Schedule List Retrieval (Not needed for new Schedule registration)
6.  Backup Job Registration
```

## Authentication Method

After obtaining an API token, all subsequent API requests must include the following authentication header:

```txt
authorization: {issued token}
```

## Common Response Format

All API responses follow this structure:

```json
{
  "requestID": "Request unique ID",
  "message": "Processing result message",
  "success": true/false,
  "data": { /* Response data */ },
  "timestamp": "Request processing time (ISO 8601 format)"
}
```

[ POST, GET ] /api/backups
[ GET, DELETE, PUT ] /api/backups/job-id/:jobId
[ GET, DELETE, PUT ] /api/backups/job-name/:jobName
[ GET ] /api/backups/server-name/:serverName
[ GET ] /api/backups/job-id/:jobId/monitoring
[ GET ] /api/backups/job-name/:jobName/monitoring
[ GET ] /api/backups/server-name/:serverName/monitoring
[ ] /api/backups/job-id/:jobId/histories
[ ] /api/backups/job-name/:jobName/histories
[ ] /api/backups/server-name/:serverName/histories
[ ] /api/backups/job-id/:jobId/logs
[ ] /api/backups/job-name/:jobName/logs
[ ] /api/backups/server-name/:serverName/logs
[ GET, POST ] /api/schedules
