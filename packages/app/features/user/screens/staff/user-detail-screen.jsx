'use client'

import React, { useMemo, useTransition } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { StaffLayout } from '../../../back-office/components/staff/staff-layout.web'
import AccountDetails from '../../components/admin/user-management/account-details'
import { clearAuthToken } from '../../../../provider/api/client'

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
      onLogout={async () => {
        // Xóa token khi đăng xuất
        await clearAuthToken()
        // Dùng window.location.href để đảm bảo redirect hoạt động
        // Redirect về /staff để hiển thị login form
        if (typeof window !== 'undefined') {
          window.location.href = '/staff'
        } else {
          router.push('/staff')
        }
      }}
    />
  )
}

export default StaffUserDetailScreen


