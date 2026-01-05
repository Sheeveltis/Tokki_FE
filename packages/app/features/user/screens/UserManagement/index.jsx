'use client'

import React from 'react'
import AccountManage from './components/account-manage'

/**
 * UserManagement screen wrapper.
 * Toàn bộ logic/list user nằm trong `components/account-manage.jsx`.
 */
export function UserManagement(props) {
  return <AccountManage {...props} />
}

export default UserManagement

