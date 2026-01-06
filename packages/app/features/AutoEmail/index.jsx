import React from 'react'
import { AutoEmail as AdminAutoEmail } from '../admin/screens/AutoEmail'

/**
 * Wrapper feature cho AutoEmail dùng trong Admin & Staff
 * Đảm bảo các lazy import `../AutoEmail` hoạt động đúng sau khi refactor màn hình vào `admin/screens/AutoEmail`.
 */
export function AutoEmail(props) {
  return <AdminAutoEmail {...props} />
}

export default AutoEmail
