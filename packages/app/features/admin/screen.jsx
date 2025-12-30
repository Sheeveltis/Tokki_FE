'use client'

import React, { useMemo, useTransition, lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'solito/navigation'
import { AdminLayout } from './components/admin-layout.web'

// Lazy load components với React.lazy (thay thế next/dynamic)
const LazyUserManagement = lazy(() => import('./screens/UserManagement'))
const LazyLessonManagement = lazy(() => import('./screens/LessonManagement'))
const LazyVocabularyManagement = lazy(() => import('../vocabulary/screens/VocabularyManagement'))
const LazyFlashcardTopicManagement = lazy(() => import('../vocabulary/screens/FlashcardTopicManagement'))
const LazyBlogManagement = lazy(() => import('../blog/blog-management'))
const LazyChatSupport = lazy(() => import('../live-chat/chat-support'))
const LazyAutoEmail = lazy(() => import('./screens/AutoEmail'))
const LazyFeedbackInbox = lazy(() => import('./screens/FeedbackInbox'))
const LazyMembershipPackage = lazy(() => import('./screens/MembershipPackage'))
const LazyPaymentManagement = lazy(() => import('./screens/PaymentManagement'))
const LazyRevenueReport = lazy(() => import('./screens/RevenueReport'))
const LazySystemLog = lazy(() => import('./screens/SystemLog'))
const LazyAIStatisticsReport = lazy(() => import('./screens/AIStatisticsReport'))
const LazySettings = lazy(() => import('./screens/Settings'))

const LoadingFallback = () => <Spin />

export function AdminScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()

  // Memoize screens để tránh tạo lại components mỗi lần render
  // Phải đặt TRƯỚC early return để tuân thủ Rules of Hooks
  const screens = useMemo(
    () => ({
      'users-admin': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyUserManagement mode="admin" />
        </Suspense>
      ),
      'users-all': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyUserManagement mode="all" />
        </Suspense>
      ),
      lessons: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyLessonManagement />
        </Suspense>
      ),
      'vocabulary-words': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyVocabularyManagement />
        </Suspense>
      ),
      'vocabulary-topics': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyFlashcardTopicManagement />
        </Suspense>
      ),
      blog: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyBlogManagement />
        </Suspense>
      ),
      'chat-support': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyChatSupport />
        </Suspense>
      ),
      'auto-email': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyAutoEmail />
        </Suspense>
      ),
      'feedback-inbox': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyFeedbackInbox />
        </Suspense>
      ),
      'membership-package': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyMembershipPackage />
        </Suspense>
      ),
      'payment-management': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyPaymentManagement />
        </Suspense>
      ),
      'revenue-report': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyRevenueReport />
        </Suspense>
      ),
      'system-log': (
        <Suspense fallback={<LoadingFallback />}>
          <LazySystemLog />
        </Suspense>
      ),
      'ai-statistics': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyAIStatisticsReport />
        </Suspense>
      ),
      settings: (
        <Suspense fallback={<LoadingFallback />}>
          <LazySettings />
        </Suspense>
      ),
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

