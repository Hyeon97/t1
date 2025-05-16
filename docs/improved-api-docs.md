# API Documentation: ZDM Portal API

- Last updated: 2025-05-12
- Version: 1.0.1
- 진행 상황
  - Auth
    - Token Issue
  - Server
    - Server Retrieval - All  
    - Server Retrieval - By Server Name
  - Center
    - Center Retrieval - All
    - Center Retrieval - By Center ID
  - License
  - Backup
    - Backup Job Registration
  - Schedule
    - Schedule Registration  
    - Schedule Retrieval
            

## Table of Contents

- [Authentication Method](#authentication-method)
- [Common Response Format](#common-response-format)
- [Auth](#auth)
  - [Token Issuance](#token-issuance)
- [Server](#server)
  - [Server Retrieval - All](#server-retrieval---all)
  - [Server Retrieval - By Server Name](#server-retrieval---by-server-name)
  - [Server Deletion - By ID](#server-deletion---by-id)
  - [Server Deletion - By Server Name](#server-deletion---by-server-name)
- [Center - ZDM Portal](#center---zdm-portal)
  - [Center Retrieval - All](#center-retrieval---all)
  - [Center Retrieval - By ID](#center-retrieval---by-id)
  - [Center Retrieval - By Center Name](#center-retrieval---by-center-name)
  - [Center Deletion - By ID](#center-deletion---by-id)
  - [Center Deletion - By Center Name](#center-deletion---by-center-name)
  - [Center Repository Registration](#center-repository-registration)
  - [Center Repository Retrieval](#center-repository-retrieval)
  - [Center Repository Modification](#center-repository-modification)
  - [Center Repository Deletion](#center-repository-deletion)
- [License](#license)
  - [License Registration](#license-registration)
  - [License Retrieval](#license-retrieval)
  - [License Deletion](#license-deletion)
  - [License Assignment](#license-assignment)
- [Backup](#backup)
  - [Backup Job Registration](#backup-job-registration)
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
  - [Backup Job History](#backup-job-history)
  - [Backup Job Logs](#backup-job-logs)
- [Schedule](#schedule)
  - [Schedule Registration](#schedule-registration)
  - [Schedule Retrieval](#schedule-retrieval)
  - [Schedule Deletion](#schedule-deletion)
- [Process Flow](#process-flow)
  - [Backup Job Registration Flow](#backup-job-registration-flow)

## Basic Information

- **Base URL**: `/api`
- **Response Format**: JSON

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

Error responses follow this structure:

```json
{
  "requestID": "Request unique ID",
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {
      "cause": "Error cause"
    }
  },
  "timestamp": "Request processing time (ISO 8601 format)"
}
```

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
curl --request POST \
  --url http://localhost:3000/api/token/issue \
  --header "Content-Type: application/json" \
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

### Response Structure (Success)

| Field      | Type    | Description                                |
| ---------- | ------- | ------------------------------------------ |
| requestID  | string  | Request unique ID.                         |
| message    | string  | Processing result message.                 |
| success    | boolean | Request success status.                    |
| data.token | string  | Issued JWT token.                          |
| timestamp  | string  | Request processing time. (ISO 8601 format) |

> **Note**: The issued token has an expiration period and must be included in the authentication header for subsequent API requests.

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

### Response Structure (Error)

| Field         | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| requestID     | string  | Request unique ID.                         |
| success       | boolean | Request success status.                    |
| error.code    | string  | Error code.                                |
| error.message | string  | Error message.                             |
| timestamp     | string  | Request processing time. (ISO 8601 format) |

<br><br>

# Server

## Server Retrieval - All

### Description

```txt
Retrieve the list of Servers registered to the ZDM Center.
```

### URL

```txt
- http
[GET] /api/servers

- Curl
curl --request GET \
  --url http://localhost:3000/api/servers \
  --header "Content-Type: application/json" \
  --header "authorization: token"
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
| mode       | string  | Optional | Type of server to retrieve. Only `source`, `target` are allowed.         | All     | `source`  |
| os         | string  | Optional | OS type of server to retrieve. Only `win`, `lin` are allowed.            | All     | `lin`     |
| connection | string  | Optional | Connection status with zdm center. Only `connect`, `disconnect` allowed. | All     | `connect` |
| license    | string  | Optional | Server license assignment status. Only `assign`, `unassign` allowed.     | All     | `assign`  |
| network    | boolean | Optional | Show server network additional information.                              | `false` | `true`    |
| disk       | boolean | Optional | Show server disk additional information.                                 | `false` | `true`    |
| partition  | boolean | Optional | Show server partition additional information.                            | `false` | `true`    |
| repository | boolean | Optional | Show server repository additional information. | `false` | `true` |
| detail     | boolean | Optional | Show server additional information.                                      | `false` | `true`    |

#### Body

```txt
None
```

### Request Example

```txt
# Filter Combinations
You can combine multiple filters to narrow down the server list:
- Windows source servers: mode=source&os=win
- Disconnected Linux servers: os=lin&connection=disconnect
- Unassigned Windows servers with full details: os=win&license=unassign&detail=true

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

<details>
<summary>Click to expand/collapse examples</summary>

```json
{
	"requestID": "8507220f-89b8-413c-af2b-5a2d4073a89c",
	"message": "Server information list",
	"success": true,
	"data": [
{
		"id": "50",
		"systemName": "RIM-WIN2008 (192.168.2.138)",
		"systemMode": "source",
		"os": "Window",
		"version": "Windows Server (R) 2008 Datacenter[64bit]",
		"ip": "218.145.120.34",
		"status": "disconnect",
		"licenseID": 74,
		"lastUpdated": "2025-05-07 11:46:20",
		"network": [
			{
				"name": "Intel(R) PRO/1000 MT Network Connection",
				"ipAddress": "192.168.2.138",
				"subNet": "255.255.252.0",
				"gateWay": "192.168.0.1",
				"macAddress": "00:50:56:A8:BA:83",
				"lastUpdated": "2024-11-21 10:32:26"
			},
		],
		"partition": [
			{
				"size": "37578858496 (35.00 GB)",
				"used": "23387344896 (21.78 GB)",
				"free": "14191513600 (13.22 GB)",
				"usage": "62.24%",
				"letter": "C:",
				"device": "Disk 0, Partion 1",
				"fileSystem": "NTFS",
				"lastUpdated": "2024-11-21 10:32:26"
			},
		],
		"repository": [
			{
				"id": "5",
				"os": "Window",
				"size": "20326709770 (18.93 GB)",
				"used": "6135196170 (5.71 GB)",
				"free": "14191513600 (13.22 GB)",
				"usage": "30.18%",
				"type": "Source Server",
				"localPath": "C:\\ZConverter",
				"remotePath": "",
				"remoteUser": "",
				"ipAddress": [
					"192.168.2.138",
					"192.168.2.47",
					"192.168.0.10"
				],
				"port": "50005",
				"lastUpdated": "2024-11-21 10:32:26"
			},
		],
		"agent": "v7 build 7016",
		"model": "VMware Virtual Platform",
		"manufacturer": "VMware, Inc.",
		"cpu": "Intel(R) Xeon(R) Silver 4216 CPU @ 2.10GHz",
		"cpuCount": "2",
		"memory": "4293414912 (4.00 GB)"
	}],
	"timestamp": "2025-05-15T03:24:04.430Z"
}
```
</details>

### Response Structure (Success)

<details>
<summary>Click to expand/collapse examples</summary>

| Field                          | Type    | Description                                           |
| ------------------------------ | ------- | ----------------------------------------------------- |
| requestID                      | string  | Request unique ID.                                    |
| message                        | string  | Processing result message.                            |
| success                        | boolean | Request success status.                               |
| data                           | array   | Server information array.                             |
| data[].id                      | string  | Server ID.                                            |
| data[].systemName              | string  | Server system name. (IP)                              |
| data[].systemMode              | string  | Server mode. (`source`/`target`)                      |
| data[].os                      | string  | Server Operating system.                              |
| data[].version                 | string  | Server OS version information.                        |
| data[].ip                      | string  | Server IP address.                                    |
| data[].status                  | string  | Server's connection status with the ZDM Center.       |
| data[].licenseID               | string  | Assigned license ID.                                  |
| data[].lastUpdated             | string  | Last update time.                                     |
| data[].agent                   | string  | Server agent version. (`detail=true`)                 |
| data[].model                   | string  | Server model. (`detail=true`)                         |
| data[].manufacturer            | string  | Server manufacturer. (`detail=true`)                  |
| data[].cpu                     | string  | Server CPU information. (`detail=true`)               |
| data[].cpuCount                | string  | Server CPU count. (`detail=true`)                     |
| data[].memory                  | string  | Server memory size. (`detail=true`)                   |
| data[].network                 | array   | Server network information array. (`network=true`) |
| data[].network[].name          | string  | Server network name. (`network=true`)                 |
| data[].network[].ipAddress     | string  | Server network IP address. (`network=true`)           |
| data[].network[].subNet        | string  | Server network subnet mask. (`network=true`)          |
| data[].network[].gateWay       | string  | Server network gateway address. (`network=true`)      |
| data[].network[].macAddress    | string  | Server MAC address. (`network=true`)                  |
| data[].network[].lastUpdated   | string  | Server network last update time. (`network=true`)     |
| data[].partition               | array   | Server partition information array. (`partition=true`) |
| data[].partition[].size        | string  | Server partition total size. (`partition=true`)       |
| data[].partition[].used        | string  | Server partition used size. (`partition=true`)        |
| data[].partition[].free        | string  | Server partition free size. (`partition=true`)        |
| data[].partition[].usage       | string  | Server partition usage rate. (`partition=true`)       |
| data[].partition[].letter      | string  | Server partition mount point. (`partition=true`)      |
| data[].partition[].device      | string  | Server partition path. (`partition=true`)             |
| data[].partition[].fileSystem  | string  | Server partition file system. (`partition=true`)      |
| data[].partition[].lastUpdated | string  | Server partition last update time. (`partition=true`) |
| data[].repository              | array   | Server repository information array. (`repository=true`) |
| data[].repository[].id         | string  | Server repository ID.(`repository=true`)                            |
| data[].repository[].os         | string  | Server repository OS type. (`repository=true`)                      |
| data[].repository[].size       | string  | Server repository total size. (`repository=true`)                   |
| data[].repository[].used       | string  | Server repository used space. (`repository=true`)                   |
| data[].repository[].free       | string  | Server repository free space. (`repository=true`)                   |
| data[].repository[].usage      | string  | Server repository usage percentage. (`repository=true`)             |
| data[].repository[].type       | string  | Server repository type. (`repository=true`)                         |
| data[].repository[].localPath  | string  | Server repository local path. (`repository=true`)                   |
| data[].repository[].remotePath | string  | Server repository remote path. (`repository=true`)                  |
| data[].repository[].remoteUser | string  | Server repository remote user. (`repository=true`)                  |
| data[].repository[].ipAddress  | array   | Server repository IP addresses. (`repository=true`)                 |
| data[].repository[].port       | string  | Server repository port.(`repository=true`)                          |
| data[].repository[].lastUpdated| string  | Server repository information last update time. (`repository=true`) |
| timestamp                      | string  | Request processing time. (ISO 8601 format)            |

</details>

## Server Retrieval - by Server Name

### Description

```txt
Retrieve specific server information by server name
```

### URL

```txt
- http
[GET] /api/servers/server-name/{serverName}

- Curl
curl --request GET \
  --url http://localhost:3000/api/server-name/{serverName} \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                                    | Default | Example |
| --------- | ------ | -------- | ---------------------------------------------- | ------- | ------- |
| serverName     | string | Required | Name of the server to retrieve.|        | test-source-server-1      |

#### Query

> This endpoint uses the same query parameters as [Server Retrieval - All](#server-retrieval---all)

#### Body

```txt
None
```

### Request Example

> This example can be used in the same way by only changing the endpoint from `/api/servers/` to `/api/servers/server-name/{serverName}` format from [Server Retrieval - All](#server-retrieval---all)

```txt
- Show all additional information
[GET] /api/servers/server-name/{serverName}?disk=true&network=true&partition=true&repository=true&detail=true

- Retrieval only target servers
[GET] /api/servers/server-name/{serverName}?mode=target

- Retrieval only Windows servers
[GET] /api/servers/server-name/{serverName}?os=win

- Retrieval only servers connected to the center
[GET] /api/servers/server-name/{serverName}?connection=connect

- Retrieval only servers without license assignment
[GET] /api/servers/server-name/{serverName}?license=unassign
```

### Response Example (Success)
> This structure is nearly identical to the **Response Example (Success)** of [Server Retrieval - All](#server-retrieval---all), but with the difference that the data array will contain only a single server object instead of multiple servers.

<details>
<summary>Click to expand/collapse examples</summary>

```json
{
	"requestID": "8507220f-89b8-413c-af2b-5a2d4073a89c",
	"message": "Server information list",
	"success": true,
	"data": {
		"id": "50",
		"systemName": "RIM-WIN2008 (192.168.2.138)",
		"systemMode": "source",
		"os": "Window",
		"version": "Windows Server (R) 2008 Datacenter[64bit]",
		"ip": "218.145.120.34",
		"status": "disconnect",
		"licenseID": 74,
		"lastUpdated": "2025-05-07 11:46:20",
		"network": [
			{
				"name": "Intel(R) PRO/1000 MT Network Connection",
				"ipAddress": "192.168.2.138",
				"subNet": "255.255.252.0",
				"gateWay": "192.168.0.1",
				"macAddress": "00:50:56:A8:BA:83",
				"lastUpdated": "2024-11-21 10:32:26"
			},
		],
		"partition": [
			{
				"size": "37578858496 (35.00 GB)",
				"used": "23387344896 (21.78 GB)",
				"free": "14191513600 (13.22 GB)",
				"usage": "62.24%",
				"letter": "C:",
				"device": "Disk 0, Partion 1",
				"fileSystem": "NTFS",
				"lastUpdated": "2024-11-21 10:32:26"
			},
		],
		"repository": [
			{
				"id": "5",
				"os": "Window",
				"size": "20326709770 (18.93 GB)",
				"used": "6135196170 (5.71 GB)",
				"free": "14191513600 (13.22 GB)",
				"usage": "30.18%",
				"type": "Source Server",
				"localPath": "C:\\ZConverter",
				"remotePath": "",
				"remoteUser": "",
				"ipAddress": [
					"192.168.2.138",
					"192.168.2.47",
					"192.168.0.10"
				],
				"port": "50005",
				"lastUpdated": "2024-11-21 10:32:26"
			},
		],
		"agent": "v7 build 7016",
		"model": "VMware Virtual Platform",
		"manufacturer": "VMware, Inc.",
		"cpu": "Intel(R) Xeon(R) Silver 4216 CPU @ 2.10GHz",
		"cpuCount": "2",
		"memory": "4293414912 (4.00 GB)"
	},
	"timestamp": "2025-05-15T03:24:04.430Z"
}
```

</details>

### Response Structure (Success)
<details>
<summary>Click to expand/collapse examples</summary>

| Field                          | Type    | Description                                           |
| ------------------------------ | ------- | ----------------------------------------------------- |
| requestID                      | string  | Request unique ID.                                    |
| message                        | string  | Processing result message.                            |
| success                        | boolean | Request success status.                               |
| data                           | object  | Server information.                             |
| data.id                        | string  | Server ID.                                            |
| data.systemName                | string  | Server system name. (IP)                              |
| data.systemMode                | string  | Server mode. (`source`/`target`)                      |
| data.os                        | string  | Server Operating system.                              |
| data.version                   | string  | Server OS version information.                        |
| data.ip                        | string  | Server IP address.                                    |
| data.status                    | string  | Server's connection status with the ZDM Center.       |
| data.licenseID                 | string  | Assigned license ID.                                  |
| data.lastUpdated               | string  | Last update time.                                     |
| data.agent                     | string  | Server agent version. (`detail=true`)                 |
| data.model                     | string  | Server model. (`detail=true`)                         |
| data.manufacturer              | string  | Server manufacturer. (`detail=true`)                  |
| data.cpu                       | string  | Server CPU information. (`detail=true`)               |
| data.cpuCount                  | string  | Server CPU count. (`detail=true`)                     |
| data.memory                    | string  | Server memory size. (`detail=true`)                   |
| data.network[].name            | string  | Server network name. (`network=true`)                 |
| data.network[].ipAddress       | string  | Server network IP address. (`network=true`)           |
| data.network[].subNet          | string  | Server network subnet mask. (`network=true`)          |
| data.network[].gateWay         | string  | Server network gateway address. (`network=true`)      |
| data.network[].macAddress      | string  | Server MAC address. (`network=true`)                  |
| data.network[].lastUpdated     | string  | Server network last update time. (`network=true`)     |
| data.partition[].size          | string  | Server partition total size. (`partition=true`)       |
| data.partition[].used          | string  | Server partition used size. (`partition=true`)        |
| data.partition[].free          | string  | Server partition free size. (`partition=true`)        |
| data.partition[].usage         | string  | Server partition usage rate. (`partition=true`)       |
| data.partition[].letter        | string  | Server partition mount point. (`partition=true`)      |
| data.partition[].device        | string  | Server partition path. (`partition=true`)             |
| data.partition[].fileSystem    | string  | Server partition file system. (`partition=true`)      |
| data.partition[].lastUpdated   | string  | Server partition last update time. (`partition=true`) |
| timestamp                      | string  | Request processing time. (ISO 8601 format)            |

</details>

## Server Deletion - By ID

### Description
> **Warning!** This feature is currently not supported. (will be supported in the future)
```txt
Delete a server registered to the ZDM Center using its ID.
```

### URL

```txt
- http
[DELETE] /api/servers/server-id/{serverId}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/servers/server-id/{serverId} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                                    | Default | Example |
| --------- | ------ | -------- | ---------------------------------------------- | ------- | ------- |
| serverId  | string | Required | ID of the server to be deleted from ZDM Center |         | 28      |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "d7c3f51c-80a9-4f7a-a49c-eaf488d59bbe",
  "message": "Server has been successfully deleted",
  "success": true,
  "data": {
    "id": "28"
  },
  "timestamp": "2025-05-12T02:45:38.721Z"
}
```

### Response Structure (Success)

| Field     | Type    | Description                                |
| --------- | ------- | ------------------------------------------ |
| requestID | string  | Request unique ID.                         |
| message   | string  | Processing result message.                 |
| success   | boolean | Request success status.                    |
| data.id   | string  | ID of the deleted server.                  |
| timestamp | string  | Request processing time. (ISO 8601 format) |

## Server Deletion - By Server Name

### Description
> **Warning!** This feature is currently not supported. (will be supported in the future)
```txt
Delete a server registered to the ZDM Center using its name.
```

### URL

```txt
- http
[DELETE] /api/servers/server-name/{serverName}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/servers/server-name/{serverName} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter  | Type   | Required | Description                                      | Default | Example           |
| ---------- | ------ | -------- | ------------------------------------------------ | ------- | ----------------- |
| serverName | string | Required | Name of the server to be deleted from ZDM Center |         | rim-ubuntu24-uefi |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "e8d4f5c6-b7a8-9123-d4e5-f6a7b8c9d0e1",
  "message": "Server has been successfully deleted",
  "success": true,
  "data": {
    "id": "28",
    "name": "rim-ubuntu24-uefi"
  },
  "timestamp": "2025-05-12T03:12:45.567Z"
}
```

### Response Structure (Success)

| Field      | Type    | Description                                |
| ---------- | ------- | ------------------------------------------ |
| requestID  | string  | Request unique ID.                         |
| message    | string  | Processing result message.                 |
| success    | boolean | Request success status.                    |
| data.id    | string  | ID of the deleted server.                  |
| data.name  | string  | Name of the deleted server.                |
| timestamp  | string  | Request processing time. (ISO 8601 format) |

<br><br>

# Center - ZDM Portal

## Center Retrieval - All

### Description

```txt
Retrieve information about ZDM Centers.
```

### URL

```txt
- http
[GET] /api/zdms

- Curl
curl --request GET \
  --url http://localhost:3000/api/zdms \
  --header "Content-Type: application/json" \
  --header "authorization: token"
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

| Parameter     | Type    | Required | Description                                                     | Default | Example    |
| ---------     | ------- | -------- | --------------------------------------------------------------- | ------- | ---------  |
| connection    | string  | Optional | Center connection status. Only `connect`, `disconnect` allowed. | All     | `connect`  |
| activation    | string  | Optional | Center activation status. Only `ok`, `fail` allowed.            | All     | `ok`       |
| network       | boolean | Optional | Show center network additional information.                     | `false` | `true`     |
| disk          | boolean | Optional | Show center disk additional information.                        | `false` | `true`     |
| partition     | boolean | Optional | Show center partition additional information.                   | `false` | `true`     |
| repository    | boolean | Optional | Show center repository additional information.                  | `false` | `true`     |
| zosRepository | boolean | Optional | Show center ZOS repository additional information.              | `false` | `true`     |
| detail        | boolean | Optional | Show center additional information.                             | `false` | `true`     |

#### Body

```txt
None
```

### Request Example

```txt
# Filter Combinations
You can combine multiple filters to narrow down the ZDM Center list:
- Connected centers: connection=connect
- Centers with activation status OK: activation=ok
- Detailed information for connected centers: connection=connect&detail=true

# Examples:
# Retrieve all ZDM Centers
[GET] /api/zdms

# Retrieve all ZDM Centers with detailed information
[GET] /api/zdms?detail=true

# Retrieve all ZDM Centers including all additional information
[GET] /api/zdms?disk=true&network=true&partition=true&repository=true&zosRepository=true&detail=true

# Retrieve only connected ZDM Centers
[GET] /api/zdms?connection=connect

# Retrieve only ZDM Centers with activation status OK
[GET] /api/zdms?activation=ok

# Retrieve only connected ZDM Centers with detailed information
[GET] /api/zdms?connection=connect&detail=true

# Retrieve ZDM Centers with repository information
[GET] /api/zdms?repository=true

# Retrieve ZDM Centers with ZOS repository information
[GET] /api/zdms?zosRepository=true
```


### Response Example (Success)

<details>
<summary>Click to expand/collapse examples</summary>

```json
{
	"requestID": "c7b58bf7-fded-4e0b-ab2d-97993834f41b",
	"message": "Zdm information list",
	"success": true,
	"data": [
		{
			"centerName": "rim-zdm-rocky8",
			"hostName": "rim-zdm-rocky8",
			"ip": "192.168.1.93",
			"state": "connect",
			"activation": "ok",
			"disk": [
				{
					"diskType": "Bios",
					"diskSize": "53687091200 (50.00 GB)",
					"diskCaption": "-",
					"lastUpdated": "2025-05-13 10:20:56"
				}
			],
			"network": [
				{
					"name": "ens192",
					"ipAddress": "192.168.1.93",
					"subNet": "255.255.252.0",
					"gateWay": "192.168.0.1",
					"macAddress": "00:50:56:a4:ee:4b",
					"lastUpdated": "2025-05-13 10:20:56"
				}
			],
			"partition": [
				{
					"size": "613184000 (584.78 MB)",
					"used": "5928000 (5.65 MB)",
					"free": "607256000 (579.12 MB)",
					"usage": "0.97%",
					"letter": "/boot/efi",
					"device": "/dev/sda1",
					"fileSystem": "vfat",
					"lastUpdated": "2025-05-13 10:20:56"
				},
			],
			"repository": [
				{
					"id": "15",
					"centerName": "rim-zdm-rocky8",
					"os": "Linux",
					"type": "NFS",
					"size": "524032000000 (488.04 GB)",
					"used": "184189676000 (171.54 GB)",
					"free": "339842324000 (316.50 GB)",
					"usage": "35.15%",
					"remotePath": "192.168.1.93:/ZConverter",
					"ipAddress": [
						"192.168.1.93"
					],
					"port": "2049",
					"lastUpdated": "2025-05-13 10:20:56"
				},
			],
			"zosRepository": [
				{
					"id": "24",
					"centerName": "rim-zdm-rocky8",
					"size": "0",
					"platform": "aws",
					"cloudKeyId": "11",
					"bucketName": "aws-velero-bucket-zconverter",
					"created": "-",
					"lastUpdated": "2025-04-02T07:40:41.000Z"
				},
			],
			"centerVersion": "v7 build 7035",
			"osVersion": "Linux Rocky Linux release 8.10 (Green Obsidian), 4.18.0-553.27.1.el8_10.x86_64",
			"model": "VMware7,1",
			"privateIP": [
				"192.168.1.93"
			],
			"organization": "Linux",
			"manufacturer": "VMware, Inc.",
			"sytemType": "x86_64",
			"cpu": "Intel(R) Xeon(R) Silver 4216 CPU @ 2.10GHz",
			"cpuCount": "2",
			"memory": "3843182592 (3.58 GB)",
			"machineID": "dca42442-7fa9-689b-8304-412cb7d103c3"
		}
	],
	"timestamp": "2025-05-16T02:52:01.641Z"
}
```
</details>

### Response Structure (Success)

<details>
<summary>Click to expand/collapse examples</summary>

| Field                              | Type    | Description                                         |
| ---------------------------------- | ------- | --------------------------------------------------- |
| requestID                          | string  | Request unique ID.                                  |
| message                            | string  | Processing result message.                          |
| success                            | boolean | Request success status.                             |
| data                               | array   | Center information array.                           |
| data[].centerName                  | string  | Center name.                                        |
| data[].hostName                    | string  | Center Host name.                                          |
| data[].ip                          | string  | Center IP address.                                         |
| data[].state                       | string  | Center Connection status.                                  |
| data[].activation                  | string  | Center Activation status.                                  |
| data[].disk                        | array   | Center Disk information array. (`disk=true`)              |
| data[].disk[].diskType             | string  | Disk type. (`disk=true`)|
| data[].disk[].diskSize             | string  | Disk size. (`disk=true`)|
| data[].disk[].diskCaption          | string  | Disk caption. (`disk=true`)|
| data[].disk[].lastUpdated          | string  | Disk information last update time. (`disk=true`)|
| data[].network                     | array   | Center Network information array. (`network=true`)         |
| data[].network[].name              | string  | Network interface name. (`network=true`)|
| data[].network[].ipAddress         | string  | Network IP address. (`network=true`)|
| data[].network[].subNet            | string  | Network subnet mask. (`network=true`)|
| data[].network[].gateWay           | string  | Network gateway address. (`network=true`)|
| data[].network[].macAddress        | string  | Network MAC address. (`network=true`)|
| data[].network[].lastUpdated       | string  | Network information last update time. (`network=true`)|
| data[].partition                   | array   | Center Partition information array. (`partition=true`)     |
| data[].partition[].size            | string  | Partition total size. (`partition=true`) |
| data[].partition[].used            | string  | Partition used space. (`partition=true`) |
| data[].partition[].free            | string  | Partition free space. (`partition=true`) |
| data[].partition[].usage           | string  | Partition usage percentage. (`partition=true`) |
| data[].partition[].letter          | string  | Mount point. (`partition=true`) |
| data[].partition[].device          | string  | Device path. (`partition=true`) |
| data[].partition[].fileSystem      | string  | File system type. (`partition=true`) |
| data[].partition[].lastUpdated     | string  | Partition information last update time. (`partition=true`) |
| data[].repository                  | array   | Center Repository information array. (`repository=true`)   |
| data[].repository[].id             | string  | Repository ID. (`repository=true`) |
| data[].repository[].centerName     | string  | Center name of the repository. (`repository=true`) |
| data[].repository[].os             | string  | Repository OS type. (`repository=true`) |
| data[].repository[].type           | string  | Repository type. (`repository=true`) |
| data[].repository[].size           | string  | Repository total size. (`repository=true`) |
| data[].repository[].used           | string  | Repository used space. (`repository=true`) |
| data[].repository[].free           | string  | Repository free space. (`repository=true`) |
| data[].repository[].usage          | string  | Repository usage percentage. (`repository=true`) |
| data[].repository[].remotePath     | string  | Repository remote path. (`repository=true`) |
| data[].repository[].ipAddress      | array   | Repository IP addresses. (`repository=true`) |
| data[].repository[].port           | string  | Repository port. (`repository=true`) |
| data[].repository[].lastUpdated    | string  | Repository information last update time. (`repository=true`) |
| data[].zosRepository               | array   | Center ZOS repository information. (`zosRepository=true`)  |
| data[].zosRepository[].id          | string  | ZOS repository ID. (`zosRepository=true`) |
| data[].zosRepository[].centerName  | string  | Center name of the ZOS repository. (`zosRepository=true`) |
| data[].zosRepository[].size        | string  | ZOS repository size. (`zosRepository=true`) |
| data[].zosRepository[].platform    | string  | Cloud platform type. (`zosRepository=true`) |
| data[].zosRepository[].cloudKeyId  | string  | Cloud key ID. (`zosRepository=true`) |
| data[].zosRepository[].bucketName  | string  | Storage bucket name. (`zosRepository=true`) |
| data[].zosRepository[].created     | string  | Creation date. (`zosRepository=true`) |
| data[].zosRepository[].lastUpdated | string  | ZOS repository last update time. (`zosRepository=true`) |
| data[].centerVersion               | string  | Center version. (`detail=true`)                     |
| data[].osVersion                   | string  | Center Operating system version. (`detail=true`)           |
| data[].model                       | string  | Center Hardware model. (`detail=true`)                     |
| data[].privateIP                   | array   | Center Private IP addresses. (`detail=true`)               |
| data[].organization                | string  | Center Organization information. (`detail=true`)           |
| data[].manufacturer                | string  | Center Hardware manufacturer. (`detail=true`)              |
| data[].sytemType                   | string  | Center System architecture type. (`detail=true`)           |
| data[].cpu                         | string  | Center CPU information. (`detail=true`)                    |
| data[].cpuCount                    | string  | Center CPU count. (`detail=true`)                          |
| data[].memory                      | string  | Center Memory size. (`detail=true`)                        |
| data[].machineID                   | string  | Center Unique machine identifier. (`detail=true`)          |
| timestamp                          | string  | Request processing time. (ISO 8601 format)          |

</details>

## Center Retrieval - By ID

### Description

```txt
Retrieve specific ZDM Center information by ZDM Center name.
```.

### URL

```txt
- http
[GET] /api/zdms/zdm-id/{zdmId}

- Curl
curl --request GET \
  --url http://localhost:3000/api/zdms/zdm-id/{zdmId} \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                                    | Default | Example |
| --------- | ------ | -------- | ---------------------------------------------- | ------- | ------- |
| zdmId     | string | Required | ID of the ZDM Center to retrieve.|        | 1      |

#### Query

> This endpoint uses the same query parameters as [Center Retrieval - All](#center-retrieval---all)

#### Body

```txt
None
```

### Request Example

> This example can be used in the same way by only changing the endpoint from `/api/zdms/` to `/api/zdms/zdm-id/{zdmId}` format from [Center Retrieval - All](#center-retrieval---all)

### Response Example (Success)

> This structure is nearly identical to the **Response Example (Success)** of [Center Retrieval - All](#center-retrieval---all), but with the difference that the data is provided as a single object rather than an array.

<details>
<summary>Click to expand/collapse examples</summary>

```json
{
	"requestID": "c7b58bf7-fded-4e0b-ab2d-97993834f41b",
	"message": "Zdm information list",
	"success": true,
	"data": {
			"centerName": "rim-zdm-rocky8",
			"hostName": "rim-zdm-rocky8",
			"ip": "192.168.1.93",
			"state": "connect",
			"activation": "ok",
			"disk": [
				{
					"diskType": "Bios",
					"diskSize": "53687091200 (50.00 GB)",
					"diskCaption": "-",
					"lastUpdated": "2025-05-13 10:20:56"
				}
			],
			"network": [
				{
					"name": "ens192",
					"ipAddress": "192.168.1.93",
					"subNet": "255.255.252.0",
					"gateWay": "192.168.0.1",
					"macAddress": "00:50:56:a4:ee:4b",
					"lastUpdated": "2025-05-13 10:20:56"
				}
			],
			"partition": [
				{
					"size": "613184000 (584.78 MB)",
					"used": "5928000 (5.65 MB)",
					"free": "607256000 (579.12 MB)",
					"usage": "0.97%",
					"letter": "/boot/efi",
					"device": "/dev/sda1",
					"fileSystem": "vfat",
					"lastUpdated": "2025-05-13 10:20:56"
				},
			],
			"repository": [
				{
					"id": "15",
					"centerName": "rim-zdm-rocky8",
					"os": "Linux",
					"type": "NFS",
					"size": "524032000000 (488.04 GB)",
					"used": "184189676000 (171.54 GB)",
					"free": "339842324000 (316.50 GB)",
					"usage": "35.15%",
					"remotePath": "192.168.1.93:/ZConverter",
					"ipAddress": [
						"192.168.1.93"
					],
					"port": "2049",
					"lastUpdated": "2025-05-13 10:20:56"
				},
			],
			"zosRepository": [
				{
					"id": "24",
					"centerName": "rim-zdm-rocky8",
					"size": "0",
					"platform": "aws",
					"cloudKeyId": "11",
					"bucketName": "aws-velero-bucket-zconverter",
					"created": "-",
					"lastUpdated": "2025-04-02T07:40:41.000Z"
				},
			],
			"centerVersion": "v7 build 7035",
			"osVersion": "Linux Rocky Linux release 8.10 (Green Obsidian), 4.18.0-553.27.1.el8_10.x86_64",
			"model": "VMware7,1",
			"privateIP": [
				"192.168.1.93"
			],
			"organization": "Linux",
			"manufacturer": "VMware, Inc.",
			"sytemType": "x86_64",
			"cpu": "Intel(R) Xeon(R) Silver 4216 CPU @ 2.10GHz",
			"cpuCount": "2",
			"memory": "3843182592 (3.58 GB)",
			"machineID": "dca42442-7fa9-689b-8304-412cb7d103c3"
		},
	"timestamp": "2025-05-16T02:52:01.641Z"
}
```
</details>

### Response Structure (Success)

<details>
<summary>Click to expand/collapse examples</summary>

| Field                         | Type    | Description                                         |
| ----------------------------- | ------- | --------------------------------------------------- |
| requestID                     | string  | Request unique ID.                                  |
| message                       | string  | Processing result message.                          |
| success                       | boolean | Request success status.                             |
| data                          | object  | Center information object.                          |
| data.centerName               | string  | Center name.                                        |
| data.hostName                 | string  | Center Host name.                                   |
| data.ip                       | string  | Center IP address.                                  |
| data.state                    | string  | Center Connection status.                           |
| data.activation               | string  | Center Activation status.                           |
| data.disk                     | array   | Center Disk information array. (`disk=true`)        |
| data.disk[].diskType          | string  | Disk type. (`disk=true`)                           |
| data.disk[].diskSize          | string  | Disk size. (`disk=true`)                           |
| data.disk[].diskCaption       | string  | Disk caption. (`disk=true`)                        |
| data.disk[].lastUpdated       | string  | Disk information last update time. (`disk=true`)   |
| data.network                  | array   | Center Network information array. (`network=true`) |
| data.network[].name           | string  | Network interface name. (`network=true`)           |
| data.network[].ipAddress      | string  | Network IP address. (`network=true`)               |
| data.network[].subNet         | string  | Network subnet mask. (`network=true`)              |
| data.network[].gateWay        | string  | Network gateway address. (`network=true`)          |
| data.network[].macAddress     | string  | Network MAC address. (`network=true`)              |
| data.network[].lastUpdated    | string  | Network information last update time. (`network=true`) |
| data.partition                | array   | Center Partition information array. (`partition=true`) |
| data.partition[].size         | string  | Partition total size. (`partition=true`)           |
| data.partition[].used         | string  | Partition used space. (`partition=true`)           |
| data.partition[].free         | string  | Partition free space. (`partition=true`)           |
| data.partition[].usage        | string  | Partition usage percentage. (`partition=true`)     |
| data.partition[].letter       | string  | Mount point. (`partition=true`)                    |
| data.partition[].device       | string  | Device path. (`partition=true`)                    |
| data.partition[].fileSystem   | string  | File system type. (`partition=true`)               |
| data.partition[].lastUpdated  | string  | Partition information last update time. (`partition=true`) |
| data.repository               | array   | Center Repository information array. (`repository=true`) |
| data.repository[].id          | string  | Repository ID. (`repository=true`)                 |
| data.repository[].centerName  | string  | Center name of the repository. (`repository=true`) |
| data.repository[].os          | string  | Repository OS type. (`repository=true`)            |
| data.repository[].type        | string  | Repository type. (`repository=true`)               |
| data.repository[].size        | string  | Repository total size. (`repository=true`)         |
| data.repository[].used        | string  | Repository used space. (`repository=true`)         |
| data.repository[].free        | string  | Repository free space. (`repository=true`)         |
| data.repository[].usage       | string  | Repository usage percentage. (`repository=true`)   |
| data.repository[].remotePath  | string  | Repository remote path. (`repository=true`)        |
| data.repository[].ipAddress   | array   | Repository IP addresses. (`repository=true`)       |
| data.repository[].port        | string  | Repository port. (`repository=true`)               |
| data.repository[].lastUpdated | string  | Repository information last update time. (`repository=true`) |
| data.zosRepository            | array   | Center ZOS repository information. (`zosRepository=true`) |
| data.zosRepository[].id       | string  | ZOS repository ID. (`zosRepository=true`)          |
| data.zosRepository[].centerName | string | Center name of the ZOS repository. (`zosRepository=true`) |
| data.zosRepository[].size     | string  | ZOS repository size. (`zosRepository=true`)        |
| data.zosRepository[].platform | string  | Cloud platform type. (`zosRepository=true`)        |
| data.zosRepository[].cloudKeyId | string | Cloud key ID. (`zosRepository=true`)             |
| data.zosRepository[].bucketName | string | Storage bucket name. (`zosRepository=true`)      |
| data.zosRepository[].created  | string  | Creation date. (`zosRepository=true`)              |
| data.zosRepository[].lastUpdated | string | ZOS repository last update time. (`zosRepository=true`) |
| data.centerVersion            | string  | Center version. (`detail=true`)                    |
| data.osVersion                | string  | Center Operating system version. (`detail=true`)   |
| data.model                    | string  | Center Hardware model. (`detail=true`)             |
| data.privateIP                | array   | Center Private IP addresses. (`detail=true`)       |
| data.organization             | string  | Center Organization information. (`detail=true`)   |
| data.manufacturer             | string  | Center Hardware manufacturer. (`detail=true`)      |
| data.sytemType                | string  | Center System architecture type. (`detail=true`)   |
| data.cpu                      | string  | Center CPU information. (`detail=true`)            |
| data.cpuCount                 | string  | Center CPU count. (`detail=true`)                  |
| data.memory                   | string  | Center Memory size. (`detail=true`)                |
| data.machineID                | string  | Center Unique machine identifier. (`detail=true`)  |
| timestamp                     | string  | Request processing time. (ISO 8601 format)         |

</details>

## Center Retrieval - By Center Name
## Center Deletion - By ID

### Description
> **Warning!** This feature is currently not supported. (will be supported in the future)
```txt
Delete a ZDM Center using its ID.
```

### URL

```txt
- http
[DELETE] /api/zdms/center-id/{centerID}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/zdms/center-id/{centerID} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                                  | Default | Example |
| --------- | ------ | -------- | -------------------------------------------- | ------- | ------- |
| centerID  | string | Required | ID of the center to be deleted from ZDM Portal |       | 6       |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "c23d45e6-7f8a-9b0c-d1e2-f3a4b5c6d7e8",
  "message": "Center has been successfully deleted",
  "success": true,
  "data": {
    "id": "6"
  },
  "timestamp": "2025-05-12T03:15:42.123Z"
}
```

### Response Structure (Success)

| Field     | Type    | Description                                |
| --------- | ------- | ------------------------------------------ |
| requestID | string  | Request unique ID.                         |
| message   | string  | Processing result message.                 |
| success   | boolean | Request success status.                    |
| data.id   | string  | ID of the deleted center.                  |
| timestamp | string  | Request processing time. (ISO 8601 format) |

## Center Deletion - By Center Name

### Description
> **Warning!** This feature is currently not supported. (will be supported in the future)
```txt
Delete a ZDM Center using its name.
```

### URL

```txt
- http
[DELETE] /api/zdms/center-name/{centerName}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/zdms/center-name/{centerName} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter  | Type   | Required | Description                                      | Default | Example       |
| ---------- | ------ | -------- | ------------------------------------------------ | ------- | ------------- |
| centerName | string | Required | Name of the center to be deleted from ZDM Portal |         | ZDM-Center-01 |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "f9e8d7c6-b5a4-3210-1234-f5e6d7c8b9a0",
  "message": "Center has been successfully deleted",
  "success": true,
  "data": {
    "id": "6",
    "name": "ZDM-Center-01"
  },
  "timestamp": "2025-05-12T03:25:18.456Z"
}
```

### Response Structure (Success)

| Field      | Type    | Description                                |
| ---------- | ------- | ------------------------------------------ |
| requestID  | string  | Request unique ID.                         |
| message    | string  | Processing result message.                 |
| success    | boolean | Request success status.                    |
| data.id    | string  | ID of the deleted center.                  |
| data.name  | string  | Name of the deleted center.                |
| timestamp  | string  | Request processing time. (ISO 8601 format) |

## Center Repository Registration

### Description
> **Warning!** This feature is currently not supported. (will be supported in the future)
```txt
Register a new repository to a ZDM Center.
```

### URL

```txt
- http
[POST] /api/zdms/{centerID}/repositories

- Curl
curl --request POST \
  --url http://localhost:3000/api/zdms/{centerID}/repositories \
  --header "Content-Type: application/json" \
  --header "authorization: token" \
  --data "{\"type\":\"smb\",\"path\":\"\\\\\\\\192.168.1.93\\\\zconverter\",\"user\":\"admin\",\"password\":\"password\"}"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                            | Default | Example |
| --------- | ------ | -------- | -------------------------------------- | ------- | ------- |
| centerID  | string | Required | ID of the center to add repository to  |         | 6       |

#### Query

```txt
None
```

#### Body

| Parameter | Type   | Required | Description                                              | Default | Example                         |
| --------- | ------ | -------- | -------------------------------------------------------- | ------- | ------------------------------- |
| type      | string | Required | Repository type. Only `smb`, `nfs` are allowed.       |         | `smb`                           |
| path      | string | Required | Repository path.                                         |         | `\\192.168.1.93\zconverter`     |
| user      | string | Optional | Username for authentication (required for SMB).          |         | `admin`                         |
| password  | string | Optional | Password for authentication (required for SMB).          |         | `password`                      |
| name      | string | Optional | Custom name for the repository.                          |         | `Main Backup Storage`           |

### Request Example

```json
{
  "type": "smb",
  "path": "\\\\192.168.1.93\\zconverter",
  "user": "admin",
  "password": "password",
  "name": "Main Backup Storage"
}
```

### Response Example (Success)

```json
{
  "requestID": "f7e6d5c4-b3a2-9180-7f6e-5d4c3b2a1098",
  "message": "Repository has been successfully registered",
  "success": true,
  "data": {
    "id": "17",
    "centerId": "6",
    "type": "SMB",
    "path": "\\\\192.168.1.93\\zconverter"
  },
  "timestamp": "2025-05-12T03:28:17.456Z"
}
```

### Response Structure (Success)

| Field        | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| requestID    | string  | Request unique ID.                         |
| message      | string  | Processing result message.                 |
| success      | boolean | Request success status.                    |
| data.id      | string  | ID of the registered repository.           |
| data.centerId| string  | ID of the center.                          |
| data.type    | string  | Repository type.                           |
| data.path    | string  | Repository path.                           |
| timestamp    | string  | Request processing time. (ISO 8601 format) |

## Center Repository Retrieval

### Description

```txt
Retrieve repositories of a ZDM Center.
```

### URL

```txt
- http
[GET] /api/zdms/repositories

- Curl
curl --request GET \
  --url http://localhost:3000/api/zdms/repositories \
  --header "Content-Type: application/json" \
  --header "authorization: token"
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

| Parameter | Type    | Required | Description                    | Default | Example |
| --------- | ------- | -------- | ------------------------------ | ------- | ------- |
| detail    | boolean | Optional | Show repository details.       | `false` | `true`  |

#### Body

```txt
None
```

### Response Example (Success)

<details>
<summary>Click to expand/collapse examples</summary>

```json
{
	"requestID": "8507220f-89b8-413c-af2b-5a2d4073a89c",
	"message": "Server information",
	"success": true,
	"data": {
		"id": "50",
		"systemName": "RIM-WIN2008 (192.168.2.138)",
		"systemMode": "source",
		"os": "Window",
		"version": "Windows Server (R) 2008 Datacenter[64bit]",
		"ip": "218.145.120.34",
		"status": "disconnect",
		"licenseID": 74,
		"lastUpdated": "2025-05-07 11:46:20",
		"network": [
			{
				"name": "Intel(R) PRO/1000 MT Network Connection",
				"ipAddress": "192.168.2.138",
				"subNet": "255.255.252.0",
				"gateWay": "192.168.0.1",
				"macAddress": "00:50:56:A8:BA:83",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"name": "VMware PCI Ethernet Adapter",
				"ipAddress": "192.168.2.47",
				"subNet": "255.255.252.0",
				"gateWay": "192.168.0.1",
				"macAddress": "00:50:56:A8:7B:F3",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"name": "vmxnet3 이더넷 어댑터",
				"ipAddress": "192.168.0.10",
				"subNet": "255.255.252.0",
				"gateWay": "192.168.0.1",
				"macAddress": "00:50:56:A8:B5:40",
				"lastUpdated": "2024-11-21 10:32:26"
			}
		],
		"partition": [
			{
				"size": "37578858496 (35.00 GB)",
				"used": "23387344896 (21.78 GB)",
				"free": "14191513600 (13.22 GB)",
				"usage": "62.24%",
				"letter": "C:",
				"device": "Disk 0, Partion 1",
				"fileSystem": "NTFS",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"size": "1073737728 (1024.00 MB)",
				"used": "36728832 (35.03 MB)",
				"free": "1037008896 (988.97 MB)",
				"usage": "3.42%",
				"letter": "H:",
				"device": "Disk 0, Partion 2",
				"fileSystem": "NTFS",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"size": "4292866048 (4.00 GB)",
				"used": "56864768 (54.23 MB)",
				"free": "4236001280 (3.95 GB)",
				"usage": "1.32%",
				"letter": "L:",
				"device": "Disk 0, Partion 3",
				"fileSystem": "NTFS",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"size": "3145723904 (2.93 GB)",
				"used": "51081216 (48.71 MB)",
				"free": "3094642688 (2.88 GB)",
				"usage": "1.62%",
				"letter": "F:",
				"device": "Disk 1, Partion 2",
				"fileSystem": "NTFS",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"size": "2186276864 (2.04 GB)",
				"used": "46268416 (44.13 MB)",
				"free": "2140008448 (1.99 GB)",
				"usage": "2.12%",
				"letter": "M:",
				"device": "Disk 1, Partion 3",
				"fileSystem": "NTFS",
				"lastUpdated": "2024-11-21 10:32:26"
			}
		],
		"repository": [
			{
				"id": "5",
				"os": "Window",
				"size": "20326709770 (18.93 GB)",
				"used": "6135196170 (5.71 GB)",
				"free": "14191513600 (13.22 GB)",
				"usage": "30.18%",
				"type": "Source Server",
				"localPath": "C:\\ZConverter",
				"remotePath": "",
				"remoteUser": "",
				"ipAddress": [
					"192.168.2.138",
					"192.168.2.47",
					"192.168.0.10"
				],
				"port": "50005",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"id": "6",
				"os": "Window",
				"size": "3094642688 (2.88 GB)",
				"used": "0 (0)",
				"free": "3094642688 (2.88 GB)",
				"usage": "0.00%",
				"type": "Source Server",
				"localPath": "F:\\ZConverter",
				"remotePath": "",
				"remoteUser": "",
				"ipAddress": [
					"192.168.2.138",
					"192.168.2.47",
					"192.168.0.10"
				],
				"port": "50005",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"id": "7",
				"os": "Window",
				"size": "2146369536 (2.00 GB)",
				"used": "0 (0)",
				"free": "2146369536 (2.00 GB)",
				"usage": "0.00%",
				"type": "Source Server",
				"localPath": "Z:\\ZConverter",
				"remotePath": "",
				"remoteUser": "",
				"ipAddress": [
					"192.168.2.138"
				],
				"port": "50005",
				"lastUpdated": "2024-11-11 21:54:15"
			},
			{
				"id": "29",
				"os": "Window",
				"size": "1037008896 (988.97 MB)",
				"used": "0 (0)",
				"free": "1037008896 (988.97 MB)",
				"usage": "0.00%",
				"type": "Source Server",
				"localPath": "H:\\ZConverter",
				"remotePath": "",
				"remoteUser": "",
				"ipAddress": [
					"192.168.2.138",
					"192.168.2.47",
					"192.168.0.10"
				],
				"port": "50005",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"id": "30",
				"os": "Window",
				"size": "4236001280 (3.95 GB)",
				"used": "0 (0)",
				"free": "4236001280 (3.95 GB)",
				"usage": "0.00%",
				"type": "Source Server",
				"localPath": "L:\\ZConverter",
				"remotePath": "",
				"remoteUser": "",
				"ipAddress": [
					"192.168.2.138",
					"192.168.2.47",
					"192.168.0.10"
				],
				"port": "50005",
				"lastUpdated": "2024-11-21 10:32:26"
			},
			{
				"id": "31",
				"os": "Window",
				"size": "2140008448 (1.99 GB)",
				"used": "0 (0)",
				"free": "2140008448 (1.99 GB)",
				"usage": "0.00%",
				"type": "Source Server",
				"localPath": "M:\\ZConverter",
				"remotePath": "",
				"remoteUser": "",
				"ipAddress": [
					"192.168.2.138",
					"192.168.2.47",
					"192.168.0.10"
				],
				"port": "50005",
				"lastUpdated": "2024-11-21 10:32:26"
			}
		],
		"agent": "v7 build 7016",
		"model": "VMware Virtual Platform",
		"manufacturer": "VMware, Inc.",
		"cpu": "Intel(R) Xeon(R) Silver 4216 CPU @ 2.10GHz",
		"cpuCount": "2",
		"memory": "4293414912 (4.00 GB)"
	},
	"timestamp": "2025-05-15T03:24:04.430Z"
}
```
</details>

### Response Structure (Success)
<details>
<summary>Click to expand/collapse examples</summary>

| Field               | Type    | Description                                |
| ------------------- | ------- | ------------------------------------------ |
| requestID           | string  | Request unique ID.                         |
| message             | string  | Processing result message.                 |
| success             | boolean | Request success status.                    |
| data                | array   | Repository information array.              |
| data[].id           | string  | Repository ID.                             |
| data[].type         | string  | Repository type.                           |
| data[].path         | string  | Repository path.                           |
| data[].name         | string  | Repository name.                           |
| data[].capacity     | string  | Repository total capacity.                 |
| data[].used         | string  | Repository used space.                     |
| data[].free         | string  | Repository free space.                     |
| data[].lastUpdated  | string  | Repository information last update time.   |
| timestamp           | string  | Request processing time. (ISO 8601 format) |
</details>

## Center Repository Modification

### Description

```txt
Modify a repository of a ZDM Center.
```

### URL

```txt
- http
[PUT] /api/zdms/{centerID}/repositories/{repositoryID}

- Curl
curl --request PUT \
  --url http://localhost:3000/api/zdms/{centerID}/repositories/{repositoryID} \
  --header "Content-Type: application/json" \
  --header "authorization: token" \
  --data "{\"name\":\"Updated Backup Storage\",\"user\":\"admin\",\"password\":\"newpassword\"}"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter    | Type   | Required | Description                  | Default | Example |
| ------------ | ------ | -------- | ---------------------------- | ------- | ------- |
| centerID     | string | Required | ID of the center             |         | 6       |
| repositoryID | string | Required | ID of the repository to modify |       | 16      |

#### Query

```txt
None
```

#### Body

| Parameter | Type   | Required | Description                                 | Default | Example                |
| --------- | ------ | -------- | ------------------------------------------- | ------- | ---------------------- |
| user      | string | Optional | New username for authentication.            |         | `admin`                |
| password  | string | Optional | New password for authentication.            |         | `newpassword`          |
| name      | string | Optional | New name for the repository.                |         | `Updated Backup Storage` |

### Request Example

```json
{
  "name": "Updated Backup Storage",
  "user": "admin",
  "password": "newpassword"
}
```

### Response Example (Success)

```json
{
  "requestID": "p9o8i7u6-y5t4-r3e2-w1q0-p9o8i7u6y5t4",
  "message": "Repository has been successfully updated",
  "success": true,
  "data": {
    "id": "16",
    "centerId": "6",
    "type": "SMB",
    "path": "\\\\192.168.1.93\\zconverter",
    "name": "Updated Backup Storage"
  },
  "timestamp": "2025-05-12T03:42:33.567Z"
}
```

### Response Structure (Success)

| Field        | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| requestID    | string  | Request unique ID.                         |
| message      | string  | Processing result message.                 |
| success      | boolean | Request success status.                    |
| data.id      | string  | Repository ID.                             |
| data.centerId| string  | Center ID.                                 |
| data.type    | string  | Repository type.                           |
| data.path    | string  | Repository path.                           |
| data.name    | string  | Updated repository name.                   |
| timestamp    | string  | Request processing time. (ISO 8601 format) |

## Center Repository Deletion

### Description

```txt
Delete a repository from a ZDM Center.
```

### URL

```txt
- http
[DELETE] /api/zdms/{centerID}/repositories/{repositoryID}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/zdms/{centerID}/repositories/{repositoryID} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter    | Type   | Required | Description                  | Default | Example |
| ------------ | ------ | -------- | ---------------------------- | ------- | ------- |
| centerID     | string | Required | ID of the center             |         | 6       |
| repositoryID | string | Required | ID of the repository to delete |       | 16      |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "z1x2c3v4-b5n6-m7l8-k9j0-h1g2f3d4s5a6",
  "message": "Repository has been successfully deleted",
  "success": true,
  "data": {
    "id": "16",
    "centerId": "6"
  },
  "timestamp": "2025-05-12T03:48:55.789Z"
}
```

### Response Structure (Success)

| Field        | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| requestID    | string  | Request unique ID.                         |
| message      | string  | Processing result message.                 |
| success      | boolean | Request success status.                    |
| data.id      | string  | ID of the deleted repository.              |
| data.centerId| string  | ID of the center.                          |
| timestamp    | string  | Request processing time. (ISO 8601 format) |

<br><br>

# License

## License Registration

### Description

```txt
Register a new license in the ZDM Portal.
```

### URL

```txt
- http
[POST] /api/licenses

- Curl
curl --request POST \
  --url http://localhost:3000/api/licenses \
  --header "Content-Type: application/json" \
  --header "authorization: token" \
  --data "{\"key\":\"ZDMC-XXXX-XXXX-XXXX-XXXX\",\"name\":\"Enterprise License\"}"
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

| Parameter | Type   | Required | Description                   | Default | Example                   |
| --------- | ------ | -------- | ----------------------------- | ------- | ------------------------- |
| key       | string | Required | License key.                  |         | `ZDMC-XXXX-XXXX-XXXX-XXXX` |
| name      | string | Optional | Custom name for the license.  |         | `Enterprise License`      |

### Request Example

```json
{
  "key": "ZDMC-XXXX-XXXX-XXXX-XXXX",
  "name": "Enterprise License"
}
```

### Response Example (Success)

```json
{
  "requestID": "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
  "message": "License has been successfully registered",
  "success": true,
  "data": {
    "id": "74",
    "key": "ZDMC-XXXX-XXXX-XXXX-XXXX",
    "type": "Server Backup License",
    "expiration": "2026-05-12",
    "status": "Active"
  },
  "timestamp": "2025-05-12T04:12:37.890Z"
}
```

### Response Structure (Success)

| Field          | Type    | Description                                |
| -------------- | ------- | ------------------------------------------ |
| requestID      | string  | Request unique ID.                         |
| message        | string  | Processing result message.                 |
| success        | boolean | Request success status.                    |
| data.id        | string  | ID of the registered license.              |
| data.key       | string  | License key.                               |
| data.type      | string  | License type.                              |
| data.expiration| string  | License expiration date.                   |
| data.status    | string  | License status.                            |
| timestamp      | string  | Request processing time. (ISO 8601 format) |

## License Retrieval

### Description

```txt
Retrieve licenses registered in the ZDM Portal.
```

### URL

```txt
- http
[GET] /api/licenses

- Curl
curl --request GET \
  --url http://localhost:3000/api/licenses \
  --header "Content-Type: application/json" \
  --header "authorization: token"
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

| Parameter | Type    | Required | Description                | Default | Example |
| --------- | ------- | -------- | -------------------------- | ------- | ------- |
| status    | string  | Optional | License status filter.     |         | `active` |
| type      | string  | Optional | License type filter.       |         | `backup` |
| assigned  | boolean | Optional | License assignment filter. | `false` | `true`  |
| detail    | boolean | Optional | Show license details.      | `false` | `true`  |

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "j9k8l7m6-n5b4-v3c2-x1z0-j9k8l7m6n5b4",
  "message": "License information list",
  "success": true,
  "data": [
    {
      "id": "74",
      "key": "ZDMC-XXXX-XXXX-XXXX-XXXX",
      "type": "Server Backup License",
      "expiration": "2026-05-12",
      "status": "Active",
      "assigned": true,
      "assignedTo": {
        "id": "28",
        "name": "rim-ubuntu24-uefi (192.168.1.12)"
      },
      "detail": {
        "registeredDate": "2025-05-05T10:15:22.345Z",
        "lastUpdated": "2025-05-12T04:12:37.890Z",
        "features": [
          "Full Backup",
          "Incremental Backup",
          "Smart Backup",
          "Encryption"
        ]
      }
    }
  ],
  "timestamp": "2025-05-12T04:18:45.123Z"
}
```

### Response Structure (Success)

| Field                | Type    | Description                                |
| -------------------- | ------- | ------------------------------------------ |
| requestID            | string  | Request unique ID.                         |
| message              | string  | Processing result message.                 |
| success              | boolean | Request success status.                    |
| data                 | array   | License information array.                 |
| data[].id            | string  | License ID.                                |
| data[].key           | string  | License key.                               |
| data[].type          | string  | License type.                              |
| data[].expiration    | string  | License expiration date.                   |
| data[].status        | string  | License status.                            |
| data[].assigned      | boolean | License assignment status.                 |
| data[].assignedTo    | object  | Server information if assigned.            |
| data[].assignedTo.id | string  | Server ID.                                 |
| data[].assignedTo.name | string | Server name.                              |
| data[].detail        | object  | Additional license details (`detail=true`).|
| data[].detail.registeredDate | string | License registration date.          |
| data[].detail.lastUpdated | string | License last update time.              |
| data[].detail.features | array | Features provided by the license.          |
| timestamp            | string  | Request processing time. (ISO 8601 format) |

## License Deletion

### Description

```txt
Delete a license from the ZDM Portal.
```

### URL

```txt
- http
[DELETE] /api/licenses/{licenseID}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/licenses/{licenseID} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                    | Default | Example |
| --------- | ------ | -------- | ------------------------------ | ------- | ------- |
| licenseID | string | Required | ID of the license to delete    |         | 74      |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "a7s8d9f0-g6h5-j4k3-l2m1-n0b9v8c7x6z5",
  "message": "License has been successfully deleted",
  "success": true,
  "data": {
    "id": "74"
  },
  "timestamp": "2025-05-12T04:25:12.345Z"
}
```

### Response Structure (Success)

| Field     | Type    | Description                                |
| --------- | ------- | ------------------------------------------ |
| requestID | string  | Request unique ID.                         |
| message   | string  | Processing result message.                 |
| success   | boolean | Request success status.                    |
| data.id   | string  | ID of the deleted license.                 |
| timestamp | string  | Request processing time. (ISO 8601 format) |

## License Assignment

### Description

```txt
Assign a license to a server.
```

### URL

```txt
- http
[POST] /api/licenses/{licenseID}/assign

- Curl
curl --request POST \
  --url http://localhost:3000/api/licenses/{licenseID}/assign \
  --header "Content-Type: application/json" \
  --header "authorization: token" \
  --data "{\"serverId\":\"28\"}"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                         | Default | Example |
| --------- | ------ | -------- | ----------------------------------- | ------- | ------- |
| licenseID | string | Required | ID of the license to assign         |         | 74      |

#### Query

```txt
None
```

#### Body

| Parameter | Type   | Required | Description                 | Default | Example |
| --------- | ------ | -------- | --------------------------- | ------- | ------- |
| serverId  | string | Required | ID of the server to assign  |         | 28      |

### Request Example

```json
{
  "serverId": "28"
}
```

### Response Example (Success)

```json
{
  "requestID": "p1o2i3u4-y5t6-r7e8-w9q0-a1s2d3f4g5h6",
  "message": "License has been successfully assigned",
  "success": true,
  "data": {
    "licenseId": "74",
    "serverId": "28",
    "serverName": "rim-ubuntu24-uefi (192.168.1.12)"
  },
  "timestamp": "2025-05-12T04:32:18.765Z"
}
```

### Response Structure (Success)

| Field         | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| requestID     | string  | Request unique ID.                         |
| message       | string  | Processing result message.                 |
| success       | boolean | Request success status.                    |
| data.licenseId| string  | ID of the assigned license.                |
| data.serverId | string  | ID of the server.                          |
| data.serverName| string | Name of the server.                        |
| timestamp     | string  | Request processing time. (ISO 8601 format) |

# Backup

## Backup Job Registration

### Description

```txt
Registers a new Backup Job with the ZDM Center.
```

### URL

```txt
- http
[POST] /api/backups

- Curl
curl --request POST \
  --url http://localhost:3000/api/backups \
  --header "Content-Type: application/json" \
  --header "authorization: token" \
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

| Parameter                     | Type             | Required | Description                                                                                                                                | Default        | Example                                                       |
| ----------------------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------------------------------------------------------- |
| center                        | string           | Required | Center ID (numeric) or Center name (string).                                                                                               |                | "123" or "Main Center"                                        |
| server                        | string           | Required | Job server ID (numeric) or server name (string).                                                                                           |                | "456" or "source-server-01"                                   |
| type                          | string           | Required | Job type. Only `full`, `inc`, `smart` are allowed.                                                                                       |                | `full`                                                        |
| partition                     | string[]         | Required | Job partitions. (If omitted, all partitions will be registered.)                                                                           | All partitions | ["/", "/test", "/test2"]                                      |
| repository                    | object           | Required | Repository to be used for the job.                                                                                                         |                | see below                                                     |
| repository.id                 | string           | Required | Repository ID.                                                                                                                             |                | "789"                                                         |
| repository.type               | string           | Optional | Repository type. Only `smb`, `nfs` are allowed.                                                                                           |                | `smb`                                                         |
| repository.path               | string           | Optional | Repository path.                                                                                                                           |                | `smb`: \\\\127.0.0.1\\ZConverter `nfs`: 127.0.0.1:/ZConverter |
| jobName                       | string           | Optional | Job name.                                                                                                                                  |                | "Daily-DB-Backup"                                             |
| user                          | string           | Optional | User ID (numeric) or user email (string).                                                                                                  |                | "101" or "admin@example.com"                                  |
| schedule                      | object           | Optional | Schedule to be used for the job. For `full` or `inc` type, use only relevant key. For `smart` type, both `full` and `inc` must be present. |                | see below                                                     |
| schedule.type                 | string           | Optional | Schedule type. (`0-6` for `full` and `inc`, `7-11` for `smart`)                                                                            |                | "5"                                                           |
| schedule.full                 | string or object | Optional | Registered schedule ID (numeric) or new schedule configuration.                                                                            |                | "202" or see below                                            |
| schedule.full.year            | string           | Optional | Year configuration. Must be in `YYYY` format. (varies by schedule type.)                                                                   |                | "2025"                                                        |
| schedule.full.month           | string           | Optional | Month configuration. Values from `1 to 12` only. (varies by schedule type.)                                                                |                | "1,3,5,7,9,11"                                                |
| schedule.full.week            | string           | Optional | Week configuration. Values from `1 to 5` only. (varies by schedule type.)                                                                  |                | "1,3,4"                                                       |
| schedule.full.day             | string           | Optional | Day configuration. Values from `1 to 31` only. (varies by schedule type.)                                                                  |                | "1,15" or "mon, sat, sun"                                     |
| schedule.full.time            | string           | Optional | Time configuration. Must be in `HH:MM` format (00:00 - 24:00). (varies by schedule type.)                                                  |                | "02:00"                                                       |
| schedule.full.interval.hour   | string           | Optional | Hour interval. (varies by schedule type.)                                                                                                  |                | "4"                                                           |
| schedule.full.interval.minute | string           | Optional | Minute interval. (varies by schedule type.)                                                                                                |                | "30"                                                          |
| schedule.increment            | string or object | Optional | Same structure as schedule.full but for incremental backup.                                                                                |                | Same structure as schedule.full                               |
| description                   | string           | Optional | Additional description.                                                                                                                    | ""             | "Weekly system backup"                                        |
| rotation                      | string           | Optional | Number of job repetitions. (`1 to 31`)                                                                                                        | "1"            | "7"                                                           |
| compression                   | string           | Optional | Whether to use compression for the job.                                                                                                    | "use"          | "use" or "not use"                                            |
| encryption                    | string           | Optional | Whether to use encryption for the job.                                                                                                     | "not use"      | "use" or "not use"                                            |
| excludeDir                    | string           | Optional | Directories to exclude from the job, separated by `\|`.                                                                                    | ""             | "dir1\|dir2\|dir3"                                            |
| excludePartition              | string           | Optional | Partitions to exclude from the job, separated by `\|`.                                                                                     | ""             | "/\|/test\|/test2"                                            |
| mailEvent                     | string           | Optional | Email to receive job event notifications.                                                                                                  | user value     | "alerts@example.com"                                          |
| networkLimit                  | string           | Optional | Job network speed limit.                                                                                                                   | Unlimited      | "100"                                                         |
| autoStart                     | string           | Optional | Whether to start automatically.                                                                                                            | "not use"      | "use" or "not use"                                            |

### Request Example
<details>
<summary>Click to expand/collapse</summary>

```json
# Backup Job Registration Example
- Register a job for only the "/" partition, full backup.
- Register job using Center ID and Server ID.
- Specify Repo ID, type and path are automatically registered.
- Job name is automatically assigned.
- No schedule used, no separate description.
- Use data compression and encryption.
- Rotation 7 times.
- Exclude directories: tmp, cache, logs.
{
  "center": "6",
  "server": "28",
  "type": "full",
  "partition": ["/"],
  "repository": {
    "id": "16"
  },
  "rotation": "7",
  "compression": "use",
  "encryption": "use",
  "excludeDir": "tmp|cache|logs"
}

# Backup Job Registration Example
- Register job for all partitions, increment backup
- Register job using Center name and Server name
- Specify Repo ID, user-defined type and path
- Job name is automatically assigned
- Use increment schedule, no separate description
{
  "center": "rim-zdm-rocky8",
  "server": "rim-ubuntu24-uefi (192.168.1.12)",
  "type": "inc",
  "partition":[],
  "repository": {
    "id": "16",
    "type":"smb",
   "path":"\\\\192.168.1.93\\ZConverter"
  },
  "jobName": "Weekly-System-Backup",
  "schedule": {
    "type": "5",
    "increment": {
      "year": "",
      "month": "4",
      "week": "1",
      "day": "mon",
      "time": "12:00",
      "interval": {
        "minute": "",
        "hour": ""
      }
    }
  }
}

{
  "center": "6",
  "server": "28",
  "type": "full",
  "partition": ["/", "/test"],
  "repository": {
    "id": "16",
    "type":"smb",
    "path":"\\\\127.0.0.1\\ZConverter"
  },
  "jobName": "Weekly-System-Backup",
  "schedule": {
    "type": "10",
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
      "month": "4",
      "week": "1",
      "day": "mon",
      "time": "12:00",
      "interval": {
        "minute": "",
        "hour": ""
      }
    }
  },
  "description": "Weekly system backup for critical data",
  "rotation": "7",
  "compression": "use",
  "encryption": "use",
  "excludeDir": "tmp|cache|logs",
  "autoStart": "use"
}
```
</details>

### Response Example (Success)

```json
{
  "requestID": "15a698f9-af56-45b1-8fc6-187accdc3b98",
  "message": "Backup job data regist result",
  "success": true,
  "data": [
    {
      "state": "success",
      "job_name": "Weekly-System-Backup_ROOT_1",
      "partition": "/",
      "job_type": "Increment Backup",
      "auto_start": "not use",
      "use_schedule": "Increment Schedule"
    },
    {
      "state": "success",
      "job_name": "Weekly-System-Backup_boot_efi_1",
      "partition": "/boot/efi",
      "job_type": "Increment Backup",
      "auto_start": "not use",
      "use_schedule": "Increment Schedule"
    },
    {
      "state": "success",
      "job_name": "Weekly-System-Backup_boot_1",
      "partition": "/boot",
      "job_type": "Increment Backup",
      "auto_start": "not use",
      "use_schedule": "Increment Schedule"
    }
  ],
  "timestamp": "2025-05-13T07:26:59.802Z"
}
```

### Response Structure (Success)

| Field            | Type    | Description                                                  |
| ---------------- | ------- | ------------------------------------------------------------ |
| requestID        | string  | Request unique ID.                                           |
| message          | string  | Processing result message.                                   |
| success          | boolean | Request success status.                                      |
| data             | array   | Array of registered job information.                         |
| data[].state     | string  | Registration result status for each job.                     |
| data[].job_name  | string  | Name of the registered job.                                  |
| data[].partition | string  | Target partition for the job.                                |
| data[].job_type  | string  | Type of backup job. (Full Backup, Increment Backup, etc.)   |
| data[].auto_start| string  | Auto start setting. Only `use` or `not use` values.         |
| data[].use_schedule | string | Schedule setting. `-` if not used, otherwise `Full Schedule`, `Increment Schedule`, or `Smart Schedule`. |
| timestamp        | string  | Request processing time. (ISO 8601 format)                   |

## Backup Job Retrieval - All

### Description

```txt
Retrieve all Backup jobs registered to the ZDM Center.
```

### URL

```txt
- http
[GET] /api/backups

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups \
  --header "Content-Type: application/json" \
  --header "authorization: token"
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
| mode           | string  | Optional | Backup job mode. Only `full`, `inc`, `smart` allowed.                          |         | `full`                                                        |
| partition      | string  | Optional | Backup job target partition. (Currently only single partition query is possible) |         | partition="/test"                                             |
| status         | string  | Optional | Backup job status.                                                               |         | `running`, `completed`, `failed`                             |
| result         | string  | Optional | Backup job result.                                                               |         | `success`, `failure`, `partial`                               |
| repositoryID   | string  | Optional | ZDM Repository ID used for Backup job.                                           |         | `16`                                                         |
| repositoryType | string  | Optional | ZDM Repository Type used for Backup job. Only `smb`, `nfs` allowed.            |         | `smb`                                                         |
| repositoryPath | string  | Optional | ZDM Repository Path used for Backup job.                                         |         | `smb`: \\\\127.0.0.1\\ZConverter `nfs`: 127.0.0.1:/ZConverter |
| detail         | boolean | Optional | Show Backup job detailed information.                                            | false   | `true`                                                        |

#### Body

```txt
None
```

### Request Example

<details>
<summary>Click to expand/collapse examples</summary>

```txt
# Retrieve all jobs
[GET] /api/backups

# Retrieve all jobs including additional information
[GET] /api/backups?detail=true

# Retrieve only Increment Backup jobs
[GET] /api/backups?mode=inc

# Retrieve only jobs for /test partition
[GET] /api/backups?partition=/test

# Retrieve only jobs with specific status
[GET] /api/backups?status=running

# Retrieve only jobs with specific result
[GET] /api/backups?result=success

# Retrieve jobs using specific repository - by ID
[GET] /api/backups?repositoryID=12

# Retrieve jobs using specific repository - by path
[GET] /api/backups?repositoryPath=\\\\127.0.0.1\\ZConverter

# Retrieve jobs by repository type
[GET] /api/backups?repositoryType=nfs

# Combined filtering
[GET] /api/backups?mode=full&status=completed&result=success&detail=true
```
</details>

### Response Example (Success)

<details>
<summary>Click to expand/collapse examples</summary>

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
      "status": "completed",
      "result": "success",
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
        "start": "2025-05-08T20:32:27.000Z",
        "end": "2025-05-08T20:34:51.000Z",
        "elapsed": "0 day, 00:02:24"
      },
      "lastUpdate": "2025-05-08T20:34:51.000Z"
    },
    {
      "id": "23",
      "jobName": "Weekly-System-Backup",
      "systemName": "rim-ubuntu24-uefi (192.168.1.12)",
      "partition": "/,/test",
      "mode": "Full Backup",
      "status": "running",
      "result": "-",
      "schedule": {
        "basic": "5",
        "advanced": "-"
      },
      "repository": {
        "id": "16",
        "type": "SMB",
        "path": "\\\\127.0.0.1\\ZConverter"
      },
      "option": {
        "rotation": "7",
        "excludeDir": "tmp|cache|logs",
        "compression": "Use",
        "encryption": "Use"
      },
      "timestamp": {
        "start": "2025-05-12T05:30:00.000Z",
        "end": "-",
        "elapsed": "0 day, 00:15:27"
      },
      "lastUpdate": "2025-05-12T05:45:27.000Z"
    }
  ],
  "timestamp": "2025-05-12T05:45:30.123Z"
}
```
</details>

### Response Structure (Success)

<details>
<summary>Click to expand/collapse examples</summary>

| Field                     | Type    | Description                                   |
| ------------------------- | ------- | --------------------------------------------- |
| requestID                 | string  | Request unique ID.                            |
| message                   | string  | Processing result message.                    |
| success                   | boolean | Request success status.                       |
| data[].id                 | string  | Job ID.                                       |
| data[].jobName            | string  | Job Name.                                     |
| data[].systemName         | string  | Source Server Name.                           |
| data[].partition          | string  | Source Server Partition(s).                   |
| data[].mode               | string  | Job Mode.                                     |
| data[].status             | string  | Job Status. (running, completed, failed)      |
| data[].result             | string  | Job Result. (success, failure, partial)       |
| data[].schedule.basic     | string  | Schedule Type.                                |
| data[].schedule.advanced  | string  | Additional Schedule Type.                     |
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
| data[].lastUpdate         | string  | Last time job information was updated.        |
| timestamp                 | string  | Request processing time. (ISO 8601 format)    |
</details>

## Backup Job Retrieval - By Job ID

### Description

```txt
Retrieve a specific backup job by its ID.
```

### URL

```txt
- http
[GET] /api/backups/job-id/{jobID}

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups/job-id/{jobID} \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                                    | Default | Example |
| --------- | ------ | -------- | ---------------------------------------------- | ------- | ------- |
| jobID     | string | Required | The unique ID of the backup job to be retrieved.|        | 22      |

#### Query
> This endpoint uses the same query parameters as [Backup Job Retrieval - All](#backup-job-retrieval---all)

#### Body

```txt
None
```

### Request Example

> This example can be used in the same way by only changing the endpoint from `/api/backups/` to `/api/backups/job-id/{jobID}` format from [Backup Job Retrieval - All](#backup-job-retrieval---all)

```txt
# Retrieve job with ID 22
[GET] /api/backups/job-id/22

# Retrieve job with ID 22 with detailed information
[GET] /api/backups/job-id/22?detail=true

```

### Response Example (Success)

> This structure is identical to the **Response Example (Success)** of [Backup Job Retrieval - All](#backup-job-retrieval---all)

### Response Structure (Success)

> This structure is identical to the **Response Structure (Success)** of [Backup Job Retrieval - All](#backup-job-retrieval---all)

## Backup Job Retrieval - By Job Name

### Description

```txt
Retrieve a specific backup job by its name.
```

### URL

```txt
- http
[GET] /api/backups/job-name/{jobName}

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups/job-name/{jobName} \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                                      | Default | Example                |
| --------- | ------ | -------- | ------------------------------------------------ | ------- | ---------------------- |
| jobName   | string | Required | The name of the backup job to be retrieved.      |         | Weekly-System-Backup   |

#### Query

> This endpoint uses the same query parameters as [Backup Job Retrieval - All](#backup-job-retrieval---all)

#### Body

```txt
None
```

### Request Example

> This example can be used in the same way by only changing the endpoint from `/api/backups/` to `/api/backups/job-name/{jobName}` format from [Backup Job Retrieval - All](#backup-job-retrieval---all)

```txt
# Retrieve job with name "Weekly-System-Backup"
[GET] /api/backups/job-name/Weekly-System-Backup

# Retrieve job with name "Weekly-System-Backup" with detailed information
[GET] /api/backups/job-name/Weekly-System-Backup?detail=true
```

### Response Example (Success)

> This structure is identical to the **Response Example (Success)** of [Backup Job Retrieval - All](#backup-job-retrieval---all)

### Response Structure (Success)

> This structure is identical to the **Response Structure (Success)** of [Backup Job Retrieval - All](#backup-job-retrieval---all)

## Backup Job Retrieval - By Source Server Name

### Description

```txt
Retrieve all backup jobs for a specific source server.
```

### URL

```txt
- http
[GET] /api/backups/server-name/{serverName}

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups/server-name/{serverName} \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter  | Type   | Required | Description                                        | Default | Example                     |
| ---------- | ------ | -------- | -------------------------------------------------- | ------- | --------------------------- |
| serverName | string | Required | The name of the server to retrieve backup jobs for. |         | rim-ubuntu24-uefi           |

#### Query

> This endpoint uses the same query parameters as [Backup Job Retrieval - All](#backup-job-retrieval---all)

| Parameter | Type    | Required | Description                           | Default | Example |
| --------- | ------- | -------- | ------------------------------------- | ------- | ------- |
| serverType | string  | Optional | When retrieving by server name, specify whether to search from source or target. Only `source`, `target` allowed. Default is to search from all. | All | `source` |

#### Body

```txt
None
```

### Request Example

> This example can be used in the same way by only changing the endpoint from `/api/backups/` to `/api/backups/server-name/{serverName}` format from [Backup Job Retrieval - All](#backup-job-retrieval---all)

```txt
# Retrieve all jobs for server "rim-ubuntu24-uefi"
[GET] /api/backups/server-name/rim-ubuntu24-uefi

# Retrieve full backup jobs for server "rim-ubuntu24-uefi"
[GET] /api/backups/server-name/rim-ubuntu24-uefi?mode=full

# Retrieve completed jobs with successful results for server "rim-ubuntu24-uefi"
[GET] /api/backups/server-name/rim-ubuntu24-uefi?status=completed&result=success
```

### Response Example (Success)

> This structure is identical to the **Response Example (Success)** of [Backup Job Retrieval - All](#backup-job-retrieval---all)

### Response Structure (Success)

> This structure is identical to the **Response Structure (Success)** of [Backup Job Retrieval - All](#backup-job-retrieval---all)


## Backup Job Modification - By Job ID

### Description

```txt
Modify a backup job by its ID.
```

### URL

```txt
- http
[PUT] /api/backups/job-id/{jobID}

- Curl
curl --request PUT \
  --url http://localhost:3000/api/backups/job-id/{jobID} \
  --header "Content-Type: application/json" \
  --header "authorization: token" \
  --data "{/* JSON Data */}"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                         | Default | Example |
| --------- | ------ | -------- | ----------------------------------- | ------- | ------- |
| jobID     | string | Required | The ID of the backup job to modify. |         | 23      |

#### Query

```txt
None
```

#### Body

The request body can include any of the parameters from the Backup Registration endpoint that you wish to modify. Only the parameters that are included will be updated.

| Parameter                     | Type             | Required | Description                                                | Default | Example                 |
| ----------------------------- | ---------------- | -------- | ---------------------------------------------------------- | ------- | ----------------------- |
| jobName                       | string           | Optional | New job name.                                              |         | "Updated-Backup-Job"    |
| repository                    | object           | Optional | New repository to be used for the job.                     |         | { "id": "17" }          |
| schedule                      | object           | Optional | New schedule configuration.                                |         | See Backup Registration |
| description                   | string           | Optional | New description.                                           |         | "Updated description"   |
| rotation                      | string           | Optional | New number of job repetitions. `(1-31)`                    |         | "10"                    |
| compression                   | string           | Optional | New compression setting.                                   |         | "not use"               |
| encryption                    | string           | Optional | New encryption setting.                                    |         | "use"                   |
| excludeDir                    | string           | Optional | New directories to exclude.                                |         | "dir1\|dir2\|dir3"      |
| excludePartition              | string           | Optional | New partitions to exclude.                                 |         | "/test"                 |
| mailEvent                     | string           | Optional | New email for notifications.                               |         | "newalerts@example.com" |
| networkLimit                  | string           | Optional | New network speed limit.                                   |         | "200"                   |
| autoStart                     | string           | Optional | New auto start setting.                                    |         | "use"                   |

### Request Example

```json
{
  "jobName": "Updated-Weekly-System-Backup",
  "rotation": "10",
  "excludeDir": "tmp|cache|logs|temp",
  "networkLimit": "200",
  "autoStart": "use"
}
```

### Response Example (Success)

```json
{
  "requestID": "j2k3l4m5-n6b7-v8c9-x0z1-j2k3l4m5n6b7",
  "message": "Backup job has been successfully updated",
  "success": true,
  "data": {
    "id": "23",
    "jobName": "Updated-Weekly-System-Backup",
    "systemName": "rim-ubuntu24-uefi (192.168.1.12)",
    "partition": "/,/test",
    "mode": "Full Backup",
    "rotation": "10",
    "excludeDir": "tmp|cache|logs|temp",
    "networkLimit": "200",
    "autoStart": "use",
    "lastUpdate": "2025-05-12T06:25:45.789Z"
  },
  "timestamp": "2025-05-12T06:25:45.789Z"
}
```

### Response Structure (Success)

| Field              | Type    | Description                                |
| ------------------ | ------- | ------------------------------------------ |
| requestID          | string  | Request unique ID.                         |
| message            | string  | Processing result message.                 |
| success            | boolean | Request success status.                    |
| data.id            | string  | Job ID.                                    |
| data.jobName       | string  | Updated job name.                          |
| data.systemName    | string  | Source server name.                        |
| data.partition     | string  | Job partitions.                            |
| data.mode          | string  | Job mode.                                  |
| data.*             | various | Other modified fields.                     |
| data.lastUpdate    | string  | Last update time.                          |
| timestamp          | string  | Request processing time. (ISO 8601 format) |

## Backup Job Modification - By Job Name

### Description

```txt
Modify a backup job by its name.
```

### URL

```txt
- http
[PUT] /api/backups/job-name/{jobName}

- Curl
curl --request PUT \
  --url http://localhost:3000/api/backups/job-name/{jobName} \
  --header "Content-Type: application/json" \
  --header "authorization: token" \
  --data "{/* JSON Data */}"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                           | Default | Example              |
| --------- | ------ | -------- | ------------------------------------- | ------- | -------------------- |
| jobName   | string | Required | The name of the backup job to modify. |         | Weekly-System-Backup |

#### Query

```txt
None
```

#### Body

The request body is identical to the "Backup Job Modification - By Job ID" endpoint.

### Request Example

```json
{
  "description": "Updated weekly backup description",
  "rotation": "10",
  "excludeDir": "tmp|cache|logs|temp",
  "networkLimit": "200",
  "autoStart": "use"
}
```

### Response Example (Success)

```json
{
  "requestID": "a9s8d7f6-g5h4-j3k2-l1m0-n9b8v7c6x5z4",
  "message": "Backup job has been successfully updated",
  "success": true,
  "data": {
    "id": "23",
    "jobName": "Weekly-System-Backup",
    "systemName": "rim-ubuntu24-uefi (192.168.1.12)",
    "partition": "/,/test",
    "mode": "Full Backup",
    "description": "Updated weekly backup description",
    "rotation": "10",
    "excludeDir": "tmp|cache|logs|temp",
    "networkLimit": "200",
    "autoStart": "use",
    "lastUpdate": "2025-05-12T06:28:39.123Z"
  },
  "timestamp": "2025-05-12T06:28:39.123Z"
}
```

### Response Structure (Success)

The response structure is identical to the "Backup Job Modification - By Job ID" endpoint.

## Backup Job Deletion - By Job ID

### Description

```txt
Delete a backup job by its ID.
```

### URL

```txt
- http
[DELETE] /api/backups/job-id/{jobID}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/backups/job-id/{jobID} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                         | Default | Example |
| --------- | ------ | -------- | ----------------------------------- | ------- | ------- |
| jobID     | string | Required | The ID of the backup job to delete. |         | 23      |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "v1c2x3z4-b5n6-m7l8-k9j0-h1g2f3d4s5a6",
  "message": "Backup job has been successfully deleted",
  "success": true,
  "data": {
    "id": "23",
    "jobName": "Updated-Weekly-System-Backup"
  },
  "timestamp": "2025-05-12T06:35:12.345Z"
}
```

### Response Structure (Success)

| Field         | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| requestID     | string  | Request unique ID.                         |
| message       | string  | Processing result message.                 |
| success       | boolean | Request success status.                    |
| data.id       | string  | ID of the deleted job.                     |
| data.jobName  | string  | Name of the deleted job.                   |
| timestamp     | string  | Request processing time. (ISO 8601 format) |

## Backup Job Deletion - By Job Name

### Description

```txt
Delete a backup job by its name.
```

### URL

```txt
- http
[DELETE] /api/backups/job-name/{jobName}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/backups/job-name/{jobName} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                           | Default | Example                        |
| --------- | ------ | -------- | ------------------------------------- | ------- | ------------------------------ |
| jobName   | string | Required | The name of the backup job to delete. |         | Updated-Weekly-System-Backup   |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "p1o2i3u4-y5t6-r7e8-w9q0-a1s2d3f4g5h6",
  "message": "Backup job has been successfully deleted",
  "success": true,
  "data": {
    "id": "23",
    "jobName": "Updated-Weekly-System-Backup"
  },
  "timestamp": "2025-05-12T06:38:24.567Z"
}
```

### Response Structure (Success)

The response structure is identical to the "Backup Job Deletion - By Job ID" endpoint.

## Backup Job Monitoring - By Job ID

### Description

```txt
Monitor a backup job's current status and progress by its ID.
```

### URL

```txt
- http
[GET] /api/backups/job-id/{jobID}/monitoring

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups/job-id/{jobID}/monitoring \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                          | Default | Example |
| --------- | ------ | -------- | ------------------------------------ | ------- | ------- |
| jobID     | string | Required | The ID of the backup job to monitor. |         | 25      |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success - Running Job)

```json
{
  "requestID": "a9s8d7f6-g5h4-j3k2-l1m0-n9b8v7c6x5z4",
  "message": "Backup job monitoring information",
  "success": true,
  "data": {
    "id": "25",
    "jobName": "Daily-Data-Backup",
    "systemName": "rim-ubuntu24-uefi (192.168.1.12)",
    "partition": "/data",
    "mode": "Incremental Backup",
    "status": "running",
    "progress": {
      "percent": 42,
      "processed": "862 MB",
      "total": "2.1 GB",
      "elapsed": "00:05:23",
      "estimated": "00:12:48",
      "speed": "2.7 MB/s",
      "stage": "Transferring data"
    },
    "timestamp": {
      "start": "2025-05-12T06:40:00.000Z",
      "current": "2025-05-12T06:45:23.000Z"
    }
  },
  "timestamp": "2025-05-12T06:45:25.678Z"
}
```

### Response Example (Success - Non-Running Job)

```json
{
  "requestID": "p1o2i3u4-y5t6-r7e8-w9q0-a1s2d3f4g5h6",
  "message": "Backup job monitoring information",
  "success": true,
  "data": {
    "id": "23",
    "jobName": "Updated-Weekly-System-Backup",
    "systemName": "rim-ubuntu24-uefi (192.168.1.12)",
    "partition": "/,/test",
    "mode": "Full Backup",
    "status": "completed",
    "result": "success",
    "timestamp": {
      "start": "2025-05-12T05:30:00.000Z",
      "end": "2025-05-12T05:52:15.000Z",
      "elapsed": "0 day, 00:22:15"
    },
    "nextSchedule": "2025-05-19T05:30:00.000Z"
  },
  "timestamp": "2025-05-12T06:45:30.123Z"
}
```

### Response Structure (Running Job)

| Field                   | Type    | Description                              |
| ----------------------- | ------- | ---------------------------------------- |
| requestID               | string  | Request unique ID.                       |
| message                 | string  | Processing result message.               |
| success                 | boolean | Request success status.                  |
| data.id                 | string  | Job ID.                                  |
| data.jobName            | string  | Job name.                                |
| data.systemName         | string  | Source server name.                      |
| data.partition          | string  | Job partitions.                          |
| data.mode               | string  | Job mode.                                |
| data.status             | string  | Job status.                              |
| data.progress           | object  | Progress information.                    |
| data.progress.percent   | number  | Completion percentage.                   |
| data.progress.processed | string  | Processed data size.                     |
| data.progress.total     | string  | Total data size.                         |
| data.progress.elapsed   | string  | Elapsed time.                            |
| data.progress.estimated | string  | Estimated completion time.               |
| data.progress.speed     | string  | Current processing speed.                |
| data.progress.stage     | string  | Current processing stage.                |
| data.timestamp.start    | string  | Job start time.                          |
| data.timestamp.current  | string  | Current monitoring time.                 |
| timestamp               | string  | Request processing time. (ISO 8601 format) |

### Response Structure (Non-Running Job)

| Field                | Type    | Description                                |
| -------------------- | ------- | ------------------------------------------ |
| requestID            | string  | Request unique ID.                         |
| message              | string  | Processing result message.                 |
| success              | boolean | Request success status.                    |
| data.id              | string  | Job ID.                                    |
| data.jobName         | string  | Job name.                                  |
| data.systemName      | string  | Source server name.                        |
| data.partition       | string  | Job partitions.                            |
| data.mode            | string  | Job mode.                                  |
| data.status          | string  | Job status.                                |
| data.result          | string  | Job result.                                |
| data.timestamp.start | string  | Job start time.                            |
| data.timestamp.end   | string  | Job end time.                              |
| data.timestamp.elapsed | string | Job elapsed time.                          |
| data.nextSchedule    | string  | Next scheduled execution time.             |
| timestamp            | string  | Request processing time. (ISO 8601 format) |

## Backup Job Monitoring - By Job Name

### Description

```txt
Monitor a backup job's current status and progress by its name.
```

### URL

```txt
- http
[GET] /api/backups/job-name/{jobName}/monitoring

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups/job-name/{jobName}/monitoring \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter | Type   | Required | Description                            | Default | Example              |
| --------- | ------ | -------- | -------------------------------------- | ------- | -------------------- |
| jobName   | string | Required | The name of the backup job to monitor. |         | Daily-Data-Backup    |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success - Running Job)

```json
{
  "requestID": "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
  "message": "Backup job monitoring information",
  "success": true,
  "data": {
    "id": "25",
    "jobName": "Daily-Data-Backup",
    "systemName": "rim-ubuntu24-uefi (192.168.1.12)",
    "partition": "/data",
    "mode": "Incremental Backup",
    "status": "running",
    "progress": {
      "percent": 45,
      "processed": "943 MB",
      "total": "2.1 GB",
      "elapsed": "00:05:45",
      "estimated": "00:12:00",
      "speed": "2.8 MB/s",
      "stage": "Transferring data"
    },
    "timestamp": {
      "start": "2025-05-12T06:40:00.000Z",
      "current": "2025-05-12T06:45:45.000Z"
    }
  },
  "timestamp": "2025-05-12T06:45:48.123Z"
}
```

### Response Example (Success - Non-Running Job)

The response for a non-running job is identical to the "Backup Job Monitoring - By Job ID" endpoint.

### Response Structure (Success)

The response structure is identical to the "Backup Job Monitoring - By Job ID" endpoint, with separate formats for running and non-running jobs.

## Backup Job Monitoring - By Source Server Name

### Description

```txt
Monitor all backup jobs' current status and progress for a specific server.
```

### URL

```txt
- http
[GET] /api/backups/server-name/{serverName}/monitoring

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups/server-name/{serverName}/monitoring \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter  | Type   | Required | Description                                              | Default | Example           |
| ---------- | ------ | -------- | -------------------------------------------------------- | ------- | ----------------- |
| serverName | string | Required | The name of the server whose backup jobs are to monitor. |         | rim-ubuntu24-uefi |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "t5y6u7i8-o9p0-a1s2-d3f4-g5h6j7k8l9m0",
  "message": "Server backup jobs monitoring information",
  "success": true,
  "data": [
    {
      "id": "23",
      "jobName": "Updated-Weekly-System-Backup",
      "partition": "/,/test",
      "mode": "Full Backup",
      "status": "completed",
      "result": "success",
      "timestamp": {
        "start": "2025-05-12T05:30:00.000Z",
        "end": "2025-05-12T05:52:15.000Z",
        "elapsed": "0 day, 00:22:15"
      },
      "nextSchedule": "2025-05-19T05:30:00.000Z"
    },
    {
      "id": "25",
      "jobName": "Daily-Data-Backup",
      "partition": "/data",
      "mode": "Incremental Backup",
      "status": "running",
      "progress": {
        "percent": 48,
        "processed": "1.01 GB",
        "total": "2.1 GB",
        "elapsed": "00:06:10",
        "estimated": "00:11:15",
        "speed": "2.9 MB/s",
        "stage": "Transferring data"
      },
      "timestamp": {
        "start": "2025-05-12T06:40:00.000Z",
        "current": "2025-05-12T06:46:10.000Z"
      }
    }
  ],
  "timestamp": "2025-05-12T06:46:15.789Z"
}
```

### Response Structure (Success)

The response includes an array of job monitoring information objects, with each object following the structure of either the "Running Job" or "Non-Running Job" as described in the "Backup Job Monitoring - By Job ID" endpoint.

## Backup Job History

### Description

```txt
Retrieve execution history for a specific backup job.
```

### URL

```txt
- http
[GET] /api/backups/job-id/{jobID}/histories
[GET] /api/backups/job-name/{jobName}/histories
[GET] /api/backups/server-name/{serverName}/histories

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups/job-id/{jobID}/histories \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter  | Type   | Required | Description                                 | Default | Example              |
| ---------- | ------ | -------- | ------------------------------------------- | ------- | -------------------- |
| jobID      | string | Required | The ID of the backup job (for job-id).      |         | 23                   |
| jobName    | string | Required | The name of the backup job (for job-name).  |         | Daily-Data-Backup    |
| serverName | string | Required | The name of the server (for server-name).   |         | rim-ubuntu24-uefi    |

#### Query

| Parameter | Type   | Required | Description                                  | Default | Example |
| --------- | ------ | -------- | -------------------------------------------- | ------- | ------- |
| start     | string | Optional | Start date for history retrieval (ISO 8601). |         | 2025-05-01T00:00:00.000Z |
| end       | string | Optional | End date for history retrieval (ISO 8601).   |         | 2025-05-12T23:59:59.999Z |
| limit     | number | Optional | Maximum number of history entries to return. | 10      | 20      |
| result    | string | Optional | Filter by result status.                     |         | success  |

#### Body

```txt
None
```

### Request Example

```txt
# Retrieve history for job with ID 23
[GET] /api/backups/job-id/23/histories

# Retrieve history for job with ID 23 with date range
[GET] /api/backups/job-id/23/histories?start=2025-05-01T00:00:00.000Z&end=2025-05-12T23:59:59.999Z

# Retrieve successful backup history entries for job name "Weekly-System-Backup"
[GET] /api/backups/job-name/Weekly-System-Backup/histories?result=success

# Retrieve up to 20 history entries for all jobs on server "rim-ubuntu24-uefi"
[GET] /api/backups/server-name/rim-ubuntu24-uefi/histories?limit=20
```

### Response Example (Success)

```json
{
  "requestID": "z1x2c3v4-b5n6-m7l8-k9j0-h1g2f3d4s5a6",
  "message": "Backup job history information",
  "success": true,
  "data": {
    "job": {
      "id": "23",
      "jobName": "Updated-Weekly-System-Backup",
      "systemName": "rim-ubuntu24-uefi (192.168.1.12)"
    },
    "histories": [
      {
        "id": "189",
        "date": "2025-05-12T05:30:00.000Z",
        "result": "success",
        "elapsed": "00:22:15",
        "details": {
          "dataSize": "5.67 GB",
          "backupSize": "2.83 GB",
          "compressionRatio": "50.1%",
          "backupSpeed": "17.8 MB/s"
        }
      },
      {
        "id": "182",
        "date": "2025-05-05T05:30:00.000Z",
        "result": "success",
        "elapsed": "00:23:10",
        "details": {
          "dataSize": "5.65 GB",
          "backupSize": "2.82 GB",
          "compressionRatio": "50.0%",
          "backupSpeed": "17.2 MB/s"
        }
      },
      {
        "id": "175",
        "date": "2025-04-28T05:30:00.000Z",
        "result": "failure",
        "elapsed": "00:05:12",
        "details": {
          "error": "Network connection lost",
          "errorCode": "E1034"
        }
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 10,
      "page": 1,
      "pages": 2
    }
  },
  "timestamp": "2025-05-12T07:05:45.123Z"
}
```

### Response Structure (Success)

| Field                        | Type    | Description                             |
| ---------------------------- | ------- | --------------------------------------- |
| requestID                    | string  | Request unique ID.                      |
| message                      | string  | Processing result message.              |
| success                      | boolean | Request success status.                 |
| data.job                     | object  | Job information.                        |
| data.job.id                  | string  | Job ID.                                 |
| data.job.jobName             | string  | Job name.                               |
| data.job.systemName          | string  | Source server name.                     |
| data.histories               | array   | History entries.                        |
| data.histories[].id          | string  | History entry ID.                       |
| data.histories[].date        | string  | Execution date.                         |
| data.histories[].result      | string  | Execution result.                       |
| data.histories[].elapsed     | string  | Execution time.                         |
| data.histories[].details     | object  | Execution details.                      |
| data.pagination              | object  | Pagination information.                 |
| data.pagination.total        | number  | Total number of history entries.        |
| data.pagination.limit        | number  | Entries per page.                       |
| data.pagination.page         | number  | Current page.                           |
| data.pagination.pages        | number  | Total number of pages.                  |
| timestamp                    | string  | Request processing time. (ISO 8601)     |

## Backup Job Logs

### Description

```txt
Retrieve logs for a specific backup job execution.
```

### URL

```txt
- http
[GET] /api/backups/job-id/{jobID}/logs
[GET] /api/backups/job-name/{jobName}/logs
[GET] /api/backups/server-name/{serverName}/logs

- Curl
curl --request GET \
  --url http://localhost:3000/api/backups/job-id/{jobID}/logs \
  --header "Content-Type: application/json" \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter  | Type   | Required | Description                               | Default | Example              |
| ---------- | ------ | -------- | ----------------------------------------- | ------- | -------------------- |
| jobID      | string | Required | The ID of the backup job (for job-id).    |         | 23                   |
| jobName    | string | Required | The name of the backup job (for job-name).|         | Daily-Data-Backup    |
| serverName | string | Required | The name of the server (for server-name). |         | rim-ubuntu24-uefi    |

#### Query

| Parameter | Type   | Required | Description                              | Default | Example |
| --------- | ------ | -------- | ---------------------------------------- | ------- | ------- |
| historyID | string | Optional | ID of specific execution history entry.  |         | 189     |
| level     | string | Optional | Log level filter.                        |         | error   |
| start     | string | Optional | Start time for log retrieval (ISO 8601). |         | 2025-05-12T05:30:00.000Z |
| end       | string | Optional | End time for log retrieval (ISO 8601).   |         | 2025-05-12T06:00:00.000Z |
| limit     | number | Optional | Maximum number of log entries to return. | 100     | 50      |

#### Body

```txt
None
```

### Request Example

```txt
# Retrieve logs for job with ID 23
[GET] /api/backups/job-id/23/logs

# Retrieve logs for a specific execution history
[GET] /api/backups/job-id/23/logs?historyID=189

# Retrieve warning and error logs for job name "Weekly-System-Backup"
[GET] /api/backups/job-name/Weekly-System-Backup/logs?level=warning

# Retrieve logs within a specific time range for server "rim-ubuntu24-uefi"
[GET] /api/backups/server-name/rim-ubuntu24-uefi/logs?start=2025-05-12T05:30:00.000Z&end=2025-05-12T06:00:00.000Z
```

### Response Example (Success)

```json
{
  "requestID": "r1e2w3q4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
  "message": "Backup job log information",
  "success": true,
  "data": {
    "job": {
      "id": "23",
      "jobName": "Updated-Weekly-System-Backup",
      "systemName": "rim-ubuntu24-uefi (192.168.1.12)"
    },
    "historyID": "189",
    "logs": [
      {
        "timestamp": "2025-05-12T05:30:00.123Z",
        "level": "info",
        "message": "Backup job started"
      },
      {
        "timestamp": "2025-05-12T05:30:01.456Z",
        "level": "info",
        "message": "Scanning partitions: /, /test"
      },
      {
        "timestamp": "2025-05-12T05:31:15.789Z",
        "level": "info",
        "message": "Found 56,789 files to backup (5.67 GB)"
      },
      {
        "timestamp": "2025-05-12T05:31:16.012Z",
        "level": "info",
        "message": "Starting data transfer to repository"
      },
      {
        "timestamp": "2025-05-12T05:48:45.678Z",
        "level": "warning",
        "message": "Slow network detected: 8.5 MB/s"
      },
      {
        "timestamp": "2025-05-12T05:52:14.321Z",
        "level": "info",
        "message": "Data transfer completed: 2.83 GB"
      },
      {
        "timestamp": "2025-05-12T05:52:15.000Z",
        "level": "info",
        "message": "Backup job completed successfully"
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 100,
      "page": 1,
      "pages": 1
    }
  },
  "timestamp": "2025-05-12T07:15:30.456Z"
}
```

### Response Structure (Success)

| Field                  | Type    | Description                             |
| ---------------------- | ------- | --------------------------------------- |
| requestID              | string  | Request unique ID.                      |
| message                | string  | Processing result message.              |
| success                | boolean | Request success status.                 |
| data.job               | object  | Job information.                        |
| data.job.id            | string  | Job ID.                                 |
| data.job.jobName       | string  | Job name.                               |
| data.job.systemName    | string  | Source server name.                     |
| data.historyID         | string  | History entry ID.                       |
| data.logs              | array   | Log entries.                            |
| data.logs[].timestamp  | string  | Log entry timestamp.                    |
| data.logs[].level      | string  | Log level.                              |
| data.logs[].message    | string  | Log message.                            |
| data.pagination        | object  | Pagination information.                 |
| data.pagination.total  | number  | Total number of log entries.            |
| data.pagination.limit  | number  | Entries per page.                       |
| data.pagination.page   | number  | Current page.                           |
| data.pagination.pages  | number  | Total number of pages.                  |
| timestamp              | string  | Request processing time. (ISO 8601)     |

# Schedule

## Schedule Registration

### Description

```txt
Register a new schedule in the ZDM Portal.
```

### URL

```txt
- http
[POST] /api/schedules

- Curl
curl --request POST \
  --url http://localhost:3000/api/schedules \
  --header "Content-Type: application/json" \
  --header "authorization: token" \
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

| Parameter        | Type   | Required | Description                                                  | Default | Example            |
| ---------------- | ------ | -------- | ------------------------------------------------------------ | ------- | ------------------ |
| type             | string | Required | Schedule type. (`0-6` for common Job, `7-11` for smart Job)        |         | "5"                |
| name             | string | Optional | Custom name for the schedule.                                 |         | "Weekly Monday"     |
| year             | string | Optional | Year configuration. Must be in `YYYY` format.                 |         | "2025"             |
| month            | string | Optional | Month configuration. Values from `1 to 12` only.              |         | "1,3,5,7,9,11"     |
| week             | string | Optional | Week configuration. Values from `1 to 5` only.                |         | "1,3"              |
| day              | string | Optional | Day configuration. Values from `1 to 31` or `mon,tue,...`     |         | "mon,wed,fri"      |
| time             | string | Optional | Time configuration. Must be in `HH:MM` format (00:00 - 24:00) |         | "02:00"            |
| interval.hour    | string | Optional | Hour interval.                                                |         | "4"                |
| interval.minute  | string | Optional | Minute interval.                                              |         | "30"               |
| description      | string | Optional | Additional description.                                       | ""      | "Every Monday at 2AM" |

### Request Example

```json
{
  "type": "5",
  "name": "Weekly Monday",
  "month": "",
  "week": "",
  "day": "mon",
  "time": "02:00",
  "interval": {
    "hour": "",
    "minute": ""
  },
  "description": "Every Monday at 2AM"
}
```

### Response Example (Success)

```json
{
  "requestID": "k1j2h3g4-f5d6-s7a8-p9o0-i1u2y3t4r5e6",
  "message": "Schedule has been successfully registered",
  "success": true,
  "data": {
		"type": " Smart Custom Monthly on Specific Month and Date",
		"scheduleID": "323622",
		"scheduleID_advanced": "645938",
		"description": [
			"[Basic] Start working on April 19 at 12:00",
			"[Advanced] Start working at 12:00 on the October, November of 25, 28"
		]
	},
  "timestamp": "2025-05-12T07:25:15.789Z"
}
```

### Response Structure (Success)

| Field                     | Type    | Description                                                           |
| ------------------------- | ------- | --------------------------------------------------------------------- |
| requestID                 | string  | Request unique ID.                                                    |
| message                   | string  | Processing result message.                                            |
| success                   | boolean | Request success status.                                               |
| data.type                 | string  | Schedule type.                                                        |
| data.scheduleID           | string  | ID of the stored basic schedule.                                      |
| data.scheduleID_advanced  | string  | ID of the stored advanced schedule. (for Smart backup types)          |
| data.description          | array   | Array of summary information for the assigned schedules.              |
| data.description[]        | string  | Human-readable description of each assigned schedule configuration.   |
| timestamp                 | string  | Request processing time. (ISO 8601 format)                            |

### Response Example (Failure)

```json
{
  "requestID": "2a37f681-da8a-4045-a591-b73008d6a575",
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "[Schedule 정보 검증] - Schedule data 검증 중 오류 발생 ( Smart Custom Monthly By Date )",
    "details": {
      "cause": "month값이 누락되었습니다."
    }
  },
  "timestamp": "2025-05-13T02:23:31.017Z"
}
```

### Response Structure (Failure)

| Field               | Type    | Description                                |
| ------------------- | ------- | ------------------------------------------ |
| requestID           | string  | Request unique ID.                         |
| success             | boolean | Request success status.                    |
| error.code          | string  | Error code.                                |
| error.message       | string  | Error message.                             |
| error.details       | object  | Additional error details.                  |
| error.details.cause | string  | Specific cause of the error.             |
| timestamp           | string  | Request processing time. (ISO 8601 format) |

## Schedule Retrieval

### Description

```txt
Retrieve schedules registered in the ZDM Portal.
```

### URL

```txt
- http
[GET] /api/schedules

- Curl
curl --request GET \
  --url http://localhost:3000/api/schedules \
  --header "Content-Type: application/json" \
  --header "authorization: token"
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

| Parameter | Type   | Required | Description                                         | Default | Example    |
| --------- | ------ | -------- | --------------------------------------------------- | ------- | ---------- |
| state     | string | Optional | Schedule state filter. Only `disabled`, `enabled` allowed. | All     | "enabled"  |

#### Body

```txt
None
```

### Request Example

```txt
# Retrieve all schedules
[GET] /api/schedules

# Retrieve only enabled schedules
[GET] /api/schedules?state=enabled

# Retrieve only disabled schedules
[GET] /api/schedules?state=disabled
```

### Response Example (Success)

```json
{
  "requestID": "577073d5-8790-46d5-bc9d-e405169458b6",
  "message": "Schedule infomation list",
  "success": true,
  "data": [
    {
      "id": "450789",
      "center": {
        "id": "6",
        "name": "rim-zdm-rocky8"
      },
      "type": "Once",
      "state": "Enabled",
      "jobName": "rim-centos8-uefi_boot",
      "lastRunTime": "2024-11-22T05:19:03.000Z",
      "description": "[Basic] Start working on 22/11/2024 14:19."
    }
  ],
  "timestamp": "2025-05-12T07:30:45.123Z"
}
```

### Response Structure (Success)

| Field              | Type    | Description                                |
| ------------------ | ------- | ------------------------------------------ |
| requestID          | string  | Request unique ID.                         |
| message            | string  | Processing result message.                 |
| success            | boolean | Request success status.                    |
| data               | array   | Schedule information array.                |
| data[].id          | string  | Schedule ID.                               |
| data[].center      | object  | Center where the schedule is stored.       |
| data[].center.id   | string  | ID of the center.                          |
| data[].center.name | string  | Name of the center.                        |
| data[].type        | string  | Schedule type.                             |
| data[].state       | string  | Schedule state. (Enabled or Disabled)      |
| data[].jobName     | string  | Name of the job assigned to this schedule. |
| data[].lastRunTime | string  | Last execution time of the schedule.       |
| data[].description | string  | Human-readable schedule description.       |
| timestamp          | string  | Request processing time. (ISO 8601 format) |

## Schedule Deletion

### Description
> **Warning!** This feature is currently not supported. (will be supported in the future)
```txt
Delete a schedule from the ZDM Portal.
```

### URL

```txt
- http
[DELETE] /api/schedules/{scheduleID}

- Curl
curl --request DELETE \
  --url http://localhost:3000/api/schedules/{scheduleID} \
  --header "authorization: token"
```

### Request Parameters

#### Headers

| Parameter     | Type   | Required | Description           | Default | Example |
| ------------- | ------ | -------- | --------------------- | ------- | ------- |
| authorization | string | Required | Authentication token. |         | token   |

#### Parameter

| Parameter  | Type   | Required | Description                     | Default | Example |
| ---------- | ------ | -------- | ------------------------------- | ------- | ------- |
| scheduleID | string | Required | ID of the schedule to delete.   |         | 36      |

#### Query

```txt
None
```

#### Body

```txt
None
```

### Response Example (Success)

```json
{
  "requestID": "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
  "message": "Schedule has been successfully deleted",
  "success": true,
  "data": {
    "id": "36",
    "name": "Weekly Monday"
  },
  "timestamp": "2025-05-12T07:35:22.789Z"
}
```

### Response Structure (Success)

| Field         | Type    | Description                                |
| ------------- | ------- | ------------------------------------------ |
| requestID     | string  | Request unique ID.                         |
| message       | string  | Processing result message.                 |
| success       | boolean | Request success status.                    |
| data.id       | string  | ID of the deleted schedule.                |
| data.name     | string  | Name of the deleted schedule.              |
| timestamp     | string  | Request processing time. (ISO 8601 format) |

# Process Flow

## Backup Job Registration Flow

```txt
Backup Job Registration Procedure:
1.  Token Issuance
    [POST] /api/token/issue
2.  Server Retrieval - All
    [GET] /api/servers
    2-1. Server Partition List Retrieval (Not needed if registering all partitions of the Server)
3.  License List Retrieval
    [GET] /api/licenses
    3-1. License Assignment to Server (Assigned to Backup job target Server)
    [POST] /api/licenses/{licenseID}/assign
4.  ZDM Center List Retrieval
    [GET] /api/zdms
    4-1. ZDM Center Repository List Retrieval
    [GET] /api/zdms/{centerID}/repositories
5.  Schedule List Retrieval (Not needed for new Schedule registration)
    [GET] /api/schedules
    5-1. (Optional) Schedule Registration
    [POST] /api/schedules
6.  Backup Job Registration
    [POST] /api/backups
```

### Backup Job Registration Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Token Issuance  ├────►   Server List    ├────►   License List   │
└────────┬────────┘     │  Retrieval      │     │  Retrieval      │
         │              └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐     ┌─────────────────┐
         │              │  (Optional)     │     │  License        │
         │              │  Server         │     │  Assignment     │
         │              │  Partition List │     │                 │
         │              └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐     ┌─────────────────┐
         └──────────────►  ZDM Center     ├────►  ZDM Center      │
                        │  List Retrieval │     │  Repository     │
                        └────────┬────────┘     │  List Retrieval │
                                 │              └────────┬────────┘
                                 │                       │
                                 ▼                       ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Schedule List  │     │  (Optional)     │
                        │  Retrieval      ├────►  Schedule        │
                        │                 │     │  Registration   │
                        └────────┬────────┘     └────────┬────────┘
                                 │                       │
                                 │                       │
                                 ▼                       ▼
                        ┌─────────────────────────────────────────┐
                        │          Backup Job Registration        │
                        └─────────────────────────────────────────┘
```