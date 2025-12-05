'use client'

import React, { useEffect, useState, useMemo, useTransition } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminLayout } from './components/admin-layout.web'
import {
  fetchUsers,
  fetchLessons,
  fetchVocabularies,
  fetchArticles,
  fetchSystemLogs,
} from './api'
import { UserManagement } from './screens/UserManagement'
import { LessonManagement } from './screens/LessonManagement'
import { VocabularyManagement } from './screens/VocabularyManagement'
import { BlogManagement } from './screens/BlogManagement'
import { ChatSupport } from './screens/ChatSupport'
import { AutoEmail } from './screens/AutoEmail'
import { FeedbackInbox } from './screens/FeedbackInbox'
import { MembershipPackage } from './screens/MembershipPackage'
import { PaymentManagement } from './screens/PaymentManagement'
import { RevenueReport } from './screens/RevenueReport'
import { SystemLog } from './screens/SystemLog'
import { Settings } from './screens/Settings'

export function AdminScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()

  const [bootLoading, setBootLoading] = useState(true)
  const [initialData, setInitialData] = useState({
    users: null,
    lessons: null,
    vocab: null,
    articles: null,
    logs: null,
  })

  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      try {
        const [users, lessons, vocab, articles, logs] = await Promise.all([
          fetchUsers(),
          fetchLessons(),
          fetchVocabularies(),
          fetchArticles(),
          fetchSystemLogs(),
        ])
        if (mounted) {
          setInitialData({ users, lessons, vocab, articles, logs })
        }
      } catch (error) {
        // Error đã được xử lý trong api/index.js với apiErrors
        console.error('Lỗi tải dữ liệu admin:', error.message)
        // Có thể thêm Alert hoặc message.error để hiển thị lỗi cho user
        if (mounted) {
          setInitialData({ users: [], lessons: [], vocab: [], articles: [], logs: [] })
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
  // Phải đặt TRƯỚC early return để tuân thủ Rules of Hooks
  const screens = useMemo(
    () => ({
      'users-admin': <UserManagement mode="admin" initialData={initialData.users} />,
      'users-all': <UserManagement mode="all" initialData={initialData.users} />,
      lessons: <LessonManagement initialData={initialData.lessons} />,
      vocab: <VocabularyManagement initialData={initialData.vocab} />,
      blog: <BlogManagement initialData={initialData.articles} />,
      'chat-support': <ChatSupport initialData={initialData.users} />,
      'auto-email': <AutoEmail />,
      'feedback-inbox': <FeedbackInbox />,
      'membership-package': <MembershipPackage />,
      'payment-management': <PaymentManagement />,
      'revenue-report': <RevenueReport />,
      'system-log': <SystemLog initialData={initialData.logs} />,
      settings: <Settings />,
    }),
    [initialData],
  )

  const handleNavigate = (key) => {
    // Sử dụng startTransition để navigation không block UI
    startTransition(() => {
      router.push(`/admin?tab=${key}`)
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
    <AdminLayout
      screens={screens}
      defaultKey={tab || 'users-all'}
      onNavigate={handleNavigate}
      onLogout={() => {
        // TODO: nối vào luồng auth thực tế
        console.log('Đăng xuất')
        router.push('/login')
      }}
    />
  )
}

export default AdminScreen

