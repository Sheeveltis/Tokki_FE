'use client'

import React from 'react'
import { useParams, useRouter } from 'solito/navigation'
import AccountDetails from '../../components/admin/user-management/account-details'

export function UserDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id

  return (
    <div style={{ height: 'calc(100vh - 90px)', overflowY: 'auto', backgroundColor: '#f0f2f5' }}>
      {userId ? (
        <AccountDetails userId={userId} onBack={() => router.back()} />
      ) : null}
    </div>
  )
}

export default UserDetailScreen
