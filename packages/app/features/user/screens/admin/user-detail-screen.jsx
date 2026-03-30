'use client'

import React, { useMemo, useTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'solito/navigation'
import { AdminLayout } from 'app/features/back-office/components/admin/admin-layout.web'
import AccountDetails from '../../components/admin/user-management/account-details'

export function UserDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab = tabParam || 'users-all'
  const [, startTransition] = useTransition()

  const handleNavigate = (key) => {
    if (key) {
      startTransition(() => {
        router.push(`/admin?tab=${key}`)
      })
    }
  }

  const detailContent = useMemo(() => {
    if (!userId) return null
    return <AccountDetails userId={userId} onBack={() => router.back()} />
  }, [userId])

  const screens = useMemo(
    () => ({
      'users-all': detailContent,
      'users-admin': detailContent,
    }),
    [detailContent],
  )

  return detailContent
}

export default UserDetailScreen



