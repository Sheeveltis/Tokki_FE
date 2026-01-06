'use client'

import React, { useMemo, useTransition } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { StaffLayout } from '../../components/staff-layout.web'
import AccountDetails from '../../../user/screens/UserManagement/components/account-details'

/**
 * StaffUserDetailScreen:
 * - Hiển thị chi tiết 1 user trong layout của Staff (không dùng AdminLayout)
 * - Dùng lại component AccountDetails chung với admin.
 */
export function StaffUserDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id
  const [, startTransition] = useTransition()

  const handleNavigate = (key) => {
    if (!key) return
    startTransition(() => {
      router.push(`/staff?tab=${key}`)
    })
  }

  const detailContent = useMemo(() => {
    if (!userId) return null
    return <AccountDetails userId={userId} />
  }, [userId])

  const screens = useMemo(
    () => ({
      users: detailContent,
    }),
    [detailContent],
  )

  return (
    <StaffLayout
      screens={screens}
      defaultKey="users"
      onNavigate={handleNavigate}
      onLogout={() => router.push('/login')}
    />
  )
}

export default StaffUserDetailScreen


