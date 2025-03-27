/**
 * user_info table 스키마 정의
 */
export interface UserInfoTable {
  idx: number
  GroupID: number
  email: string
  password: string
  confirm_date: string
  create_date: string
  last_login_date: string
  popup_block_duedate: string
  migration_count: number
  login_count: number
  username: string
  email_notice: string
  log_period: number
  data_period: number
  company: string
  company_addr: string
  company_size: string
  organization: string
  phone: string
  position: string
  country: string
  timezone: string
  language: string
  login_failed_cnt: number
  login_lock: number
  guide_val: number
  pw_data: string
}
