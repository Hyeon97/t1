//////////////////////
//  정규표현식 정의  //
//////////////////////

//  숫자만 가능
export const regNumberOnly = /^\d+$/
//  숫자와 ',' 만 가능
export const regNumbersWithComma = /^[0-9,]+$/
//  mon,tue,wed,thu,fri,sat,sun과 콤마만 가능
export const regWeekdaysWithComma = /^(mon|tue|wed|thu|fri|sat|sun)(,(mon|tue|wed|thu|fri|sat|sun))*$/
// regNumbersWithComma, regWeekdaysWithComma 조건 결합
export const regWeekdaysOrNumbersWithComma = /^((mon|tue|wed|thu|fri|sat|sun)(,(mon|tue|wed|thu|fri|sat|sun))*|[0-9,]+)$/
//  4자리 숫자만 가능
export const reg4NumberOnly = /^[0-9]{4}$/
//  기본 이메일
export const regCommonEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//  스케쥴 입력값 검증용 ( 년, 월, 주, 일 )
export const regScheduleInput = /^([0-9]+|[01|]+)$/
//  스케쥴 입력값 검증용 ( 시간 )
export const regScheduleTimeInput = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
//  smb
export const regSmbPath =
  /^(\\\\|smb:\/\/)(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})(\\|\/)([\w.$-]+(\\|\/))*([\w.$-]+)?$/
//  nfs
export const regNfsPath =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):(\/([\w.-]+))*\/?$/
//  쉼표를 제외한 모든 공백 제거
export const regCommaSeparator = /\s*,\s*/g