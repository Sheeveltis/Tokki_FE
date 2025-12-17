'use client'

import React, { useMemo, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminLayout } from './components/admin-layout.web'

const LazyUserManagement = dynamic(() => import('./screens/UserManagement'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyLessonManagement = dynamic(() => import('./screens/LessonManagement'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyVocabularyManagement = dynamic(
  () => import('../vocabulary/screens/VocabularyManagement'),
  { ssr: false, loading: () => <Spin /> }
)
const LazyFlashcardTopicManagement = dynamic(
  () => import('../vocabulary/screens/FlashcardTopicManagement'),
  { ssr: false, loading: () => <Spin /> }
)
const LazyBlogManagement = dynamic(() => import('../blog/blog-management'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyChatSupport = dynamic(() => import('../live-chat/chat-support'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyAutoEmail = dynamic(() => import('./screens/AutoEmail'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyFeedbackInbox = dynamic(() => import('./screens/FeedbackInbox'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyMembershipPackage = dynamic(() => import('./screens/MembershipPackage'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyPaymentManagement = dynamic(() => import('./screens/PaymentManagement'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyRevenueReport = dynamic(() => import('./screens/RevenueReport'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazySystemLog = dynamic(() => import('./screens/SystemLog'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazyAIStatisticsReport = dynamic(() => import('./screens/AIStatisticsReport'), {
  ssr: false,
  loading: () => <Spin />,
})
const LazySettings = dynamic(() => import('./screens/Settings'), {
  ssr: false,
  loading: () => <Spin />,
})

export function AdminScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()

  // Memoize screens để tránh tạo lại components mỗi lần render
  // Phải đặt TRƯỚC early return để tuân thủ Rules of Hooks
  const screens = useMemo(
    () => ({
      'users-admin': <LazyUserManagement mode="admin" />,
      'users-all': <LazyUserManagement mode="all" />,
      lessons: <LazyLessonManagement />,
      'vocabulary-words': <LazyVocabularyManagement />,
      'vocabulary-topics': <LazyFlashcardTopicManagement />,
      blog: <LazyBlogManagement />,
      'chat-support': <LazyChatSupport />,
      'auto-email': <LazyAutoEmail />,
      'feedback-inbox': <LazyFeedbackInbox />,
      'membership-package': <LazyMembershipPackage />,
      'payment-management': <LazyPaymentManagement />,
      'revenue-report': <LazyRevenueReport />,
      'system-log': <LazySystemLog />,
      'ai-statistics': <LazyAIStatisticsReport />,
      settings: <LazySettings />,
    }),
    [],
  )

  const handleNavigate = (key) => {
    // Sử dụng startTransition để navigation không block UI
    startTransition(() => {
      router.push(`/admin?tab=${key}`)
    })
  }

  const normalizedTab = tab === 'vocab' ? 'vocabulary-words' : tab === 'vocab-topics' ? 'vocabulary-topics' : tab

  return (
    <AdminLayout
      screens={screens}
      defaultKey={normalizedTab || 'users-all'}
      onNavigate={handleNavigate}
      onLogout={() => {
        console.log('Đăng xuất')
        router.push('/login')
      }}
    />
  )
}

export default AdminScreen

