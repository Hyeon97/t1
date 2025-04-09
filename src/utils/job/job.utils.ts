//////////////////////////
//  작업 공통 사용 함수  //
//////////////////////////

/**
 * 작업 기본 이름 자동 생성
 */
export const createDefaultJobName = ({ server, drive, os }: { server: string; drive: string; os: "win" | "lin" }): string => {
  try {
    let changed_drive_path = ""
    if (os === "win") {
      //  윈도우 에서 드라이브 이름끝 :으로 끝나는거 제거
      if (drive.endsWith(":")) {
        drive = drive.replaceAll(":", "")
      }
    }
    if (os === "lin") {
      if (drive === "/") {
        changed_drive_path = "_ROOT"
      } else {
        changed_drive_path = drive.replaceAll("/", "_")
      }
    }
    return `${server}${changed_drive_path}`
  } catch (error) {}
}
