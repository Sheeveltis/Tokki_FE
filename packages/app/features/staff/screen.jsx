'use client'

import React, { useEffect, useState, useMemo, useTransition, lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'solito/navigation'
import { StaffLayout } from './components/staff-layout.web'
import { fetchRegularUsers } from './api'
// Lazy load để giảm bundle + chỉ fetch khi cần tab
const LazyUserManagement = lazy(() => import('../user/screens/UserManagement'))
const LazyLessonManagement = lazy(() => import('../admin/screens/LessonManagement'))
const LazyVocabularyManagement = lazy(() => import('../vocabulary/screens/VocabularyManagement'))
const LazyFlashcardTopicManagement = lazy(() => import('../vocabulary/screens/FlashcardTopicManagement'))
const LazyBlogManagement = lazy(() => import('../blog/blog-management'))
const LazyChatSupport = lazy(() => import('../live-chat/chat-support'))
const LazyAutoEmail = lazy(() => import('../AutoEmail'))
const LazyFeedbackInbox = lazy(() => import('../admin/screens/FeedbackInbox'))
const LazySettings = lazy(() => import('./screens/Settings'))

// Cache dữ liệu để khi quay lại từ trang chi tiết không phải load lại toàn bộ
let cachedInitialData = null
let cachedAt = 0
const CACHE_TTL_MS = 2 * 60 * 1000 // 2 phút

const LoadingFallback = () => (
  <div
    style={{
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Spin size="large" tip="Đang tải dữ liệu..." />
  </div>
)

export function StaffScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()

  const [bootLoading, setBootLoading] = useState(true)
  const [initialData, setInitialData] = useState({
    users: null,
  })

  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      try {
        const now = Date.now()
        if (cachedInitialData && now - cachedAt < CACHE_TTL_MS) {
          setInitialData(cachedInitialData)
          return
        }

        const users = await fetchRegularUsers()
        if (mounted) {
          const nextData = { users }
          cachedInitialData = nextData
          cachedAt = now
          setInitialData(nextData)
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu staff:', error.message)
        if (mounted) {
          setInitialData({ users: [] })
        }
      } finally {
        if (mounted) setBootLoading(false)
      }
    }
    loadAll()
    return () => {
      mounted = false
    }
  }, [])

  // Memoize screens để tránh tạo lại components mỗi lần render
  const screens = useMemo(
    () => ({
      users: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyUserManagement
            basePath="/staff"
            mode="all"
            initialData={
              initialData.users
                ? {
                    items: initialData.users,
                    total: initialData.users.length,
                  }
                : null
            }
          />
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
      settings: (
        <Suspense fallback={<LoadingFallback />}>
          <LazySettings />
        </Suspense>
      ),
    }),
    [initialData],
  )

  const handleNavigate = (key) => {
    startTransition(() => {
      router.push(`/staff?tab=${key}`)
    })
  }

  if (bootLoading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    )
  }

  return (
    <StaffLayout
      screens={screens}
      defaultKey={
        (tab === 'vocab'
          ? 'vocabulary-words'
          : tab === 'vocab-topics'
            ? 'vocabulary-topics'
            : tab) || 'users'
      }
      onNavigate={handleNavigate}
      onLogout={() => {
        console.log('Đăng xuất')
        router.push('/login')
      }}
    />
  )
}

export default StaffScreen

