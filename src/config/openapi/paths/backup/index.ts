/**
 * Backup 관련 모든 경로 통합
 */

// import { backupDeletePath } from "./delete"
// import { backupDetailPath } from "./detail"
// import { backupEditPath } from "./edit"
// import { backupListPath } from "./list"
// import { backupMonitoringPath } from "./monitoring"
// import { backupRegistPath } from "./regist"

// export const backupPaths = {
//   ...backupListPath,
//   ...backupDetailPath,
//   ...backupRegistPath,
//   ...backupEditPath,
//   ...backupDeletePath,
//   ...backupMonitoringPath
// }


import { backupDeletePath } from "./delete"
import { backupDetailPath } from "./detail"
import { backupEditPath } from "./edit"
import { backupListPath } from "./list"
import { backupMonitoringPath } from "./monitoring"
import { backupRegistPath } from "./regist"

// 타입 정의
type PathMethods = Record<string, any>
type PathObject = Record<string, PathMethods>

// 각 경로 객체의 내용을 로깅하여 확인
console.log("List 경로 수:", Object.keys(backupListPath).length)
console.log("Detail 경로 수:", Object.keys(backupDetailPath).length)
console.log("Regist 경로 수:", Object.keys(backupRegistPath).length)
console.log("Edit 경로 수:", Object.keys(backupEditPath).length)
console.log("Delete 경로 수:", Object.keys(backupDeletePath).length)
console.log("Monitoring 경로 수:", Object.keys(backupMonitoringPath).length)

// 충돌 확인을 위해 모든 경로 키를 수집
const allPathKeys = [
  ...Object.keys(backupListPath),
  ...Object.keys(backupDetailPath),
  ...Object.keys(backupRegistPath),
  ...Object.keys(backupEditPath),
  ...Object.keys(backupDeletePath),
  ...Object.keys(backupMonitoringPath)
]

// 중복 경로 확인
const uniqueKeys = new Set(allPathKeys)
if (uniqueKeys.size < allPathKeys.length) {
  console.log("중복 경로 발견: 총", allPathKeys.length, "개 중", uniqueKeys.size, "개만 고유함")

  // 중복된 경로 찾기
  const keyCounts: Record<string, number> = {}
  allPathKeys.forEach(key => {
    keyCounts[key] = (keyCounts[key] || 0) + 1
  })

  // 중복된 경로 출력
  Object.entries(keyCounts)
    .filter(([_, count]) => count > 1)
    .forEach(([key, count]) => {
      console.log(`경로 '${key}'가 ${count}번 중복됨`)
    })
}

// 수동으로 병합하여 모든 메서드가 보존되도록 함
const backupPaths: PathObject = {};

// 각 경로 객체를 순회하며 명시적으로 병합
[backupListPath, backupDetailPath, backupRegistPath, backupEditPath, backupDeletePath, backupMonitoringPath].forEach((pathObj: PathObject) => {
  Object.entries(pathObj).forEach(([path, methods]) => {
    // 이미 해당 경로가 존재하는 경우 메서드만 병합
    if (backupPaths[path]) {
      backupPaths[path] = {
        ...backupPaths[path],
        ...methods
      }
    } else {
      // 경로가 처음 나타나는 경우 그대로 추가
      backupPaths[path] = methods
    }
  })
})

// 최종 병합 결과 확인
console.log("병합된 총 경로 수:", Object.keys(backupPaths).length)
Object.keys(backupPaths).forEach(path => {
  console.log(`경로: ${path}, 메서드:`, Object.keys(backupPaths[path]))
})

export { backupPaths }
