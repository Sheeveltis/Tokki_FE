'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'solito/navigation'
import { Space, Typography, Spin, Alert, message } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from 'app/features/admin/components/admin-layout.web'
import {
  fetchUsers,
  fetchLessons,
  fetchArticles,
  fetchSystemLogs,
} from 'app/features/admin/api'
import { fetchVocabularies, fetchFlashcardTopics } from 'app/features/vocabulary/api'
import { UserManagement } from 'app/features/admin/screens/UserManagement'
import { LessonManagement } from 'app/features/admin/screens/LessonManagement'
import { VocabularyManagement } from 'app/features/vocabulary/screens/VocabularyManagement'
import { FlashcardTopicManagement } from 'app/features/vocabulary/screens/FlashcardTopicManagement'
import { BlogManagement } from 'app/features/blog/blog-management'
import { ChatSupport } from '../../../live-chat/chat-support'
import { AutoEmail } from 'app/features/admin/screens/AutoEmail'
import { FeedbackInbox } from 'app/features/admin/screens/FeedbackInbox'
import { MembershipPackage } from 'app/features/admin/screens/MembershipPackage'
import { PaymentManagement } from 'app/features/admin/screens/PaymentManagement'
import { RevenueReport } from 'app/features/admin/screens/RevenueReport'
import { SystemLog } from 'app/features/admin/screens/SystemLog'
import { Settings } from 'app/features/admin/screens/Settings'
import { UpdateUserDetail } from './modal/UpdateUserDetail'
import { DeleteUserConfirm } from './modal/DeleteUserConfirm'
import AccountDetails from '../UserManagement/components/account-details'

export function UserDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab = tabParam || 'users-all'
  const [isPending, startTransition] = useTransition()

  const handleNavigate = (key) => {
    if (key) {
      startTransition(() => {
        router.push(`/admin?tab=${key}`)
      })
    }
  }

  const detailContent = useMemo(() => {
    if (!userId) return null
    return <AccountDetails userId={userId} />
  }, [userId])

  const screens = useMemo(
    () => ({
      'users-all': detailContent,
      'users-admin': detailContent,
    }),
    [detailContent],
  )

  return (
    <AdminLayout
      screens={screens}
      defaultKey={defaultTab}
      onNavigate={handleNavigate}
      onLogout={() => router.push('/login')}
    />
  )
}

export default UserDetailScreen


