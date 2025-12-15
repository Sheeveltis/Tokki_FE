'use client'

import React, { useEffect, useState, useMemo, useTransition } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminLayout } from './components/admin-layout.web'
import {
  fetchUsers,
  fetchLessons,
  fetchArticles,
  fetchSystemLogs,
} from './api'
import { fetchVocabularies, fetchFlashcardTopics } from '../vocabulary/api'
import { UserManagement } from './screens/UserManagement'
import { LessonManagement } from './screens/LessonManagement'
import { VocabularyManagement } from '../vocabulary/screens/VocabularyManagement'
import { FlashcardTopicManagement } from '../vocabulary/screens/FlashcardTopicManagement'
import { BlogManagement } from '../blog/blog-management'
import { ChatSupport } from './screens/ChatSupport'
import { AutoEmail } from './screens/AutoEmail'
import { FeedbackInbox } from './screens/FeedbackInbox'
import { MembershipPackage } from './screens/MembershipPackage'
import { PaymentManagement } from './screens/PaymentManagement'
import { RevenueReport } from './screens/RevenueReport'
import { SystemLog } from './screens/SystemLog'
import { AIStatisticsReport } from './screens/AIStatisticsReport'
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
    vocabTopics: null,
    articles: null,
    logs: null,
  })

  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      try {
        const [users, lessons, vocab, vocabTopics, articles, logs] = await Promise.all([
          fetchUsers(),
          fetchLessons(),
          fetchVocabularies(),
          fetchFlashcardTopics(),
          fetchArticles(),
          fetchSystemLogs(),
        ])
        if (mounted) {
          setInitialData({ users, lessons, vocab, vocabTopics, articles, logs })
        }
      } catch (error) {
        // Error đã được xử lý trong api/index.js với apiErrors
        console.error('Lỗi tải dữ liệu admin:', error.message)
        // Có thể thêm Alert hoặc message.error để hiển thị lỗi cho user
        if (mounted) {
          setInitialData({ users: [], lessons: [], vocab: [], vocabTopics: [], articles: [], logs: [] })
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
      'vocabulary-words': <VocabularyManagement initialData={initialData.vocab} />,
      'vocabulary-topics': <FlashcardTopicManagement initialData={initialData.vocabTopics} />,
      blog: <BlogManagement initialData={initialData.articles} />,
      'chat-support': <ChatSupport initialData={initialData.users} />,
      'auto-email': <AutoEmail />,
      'feedback-inbox': <FeedbackInbox />,
      'membership-package': <MembershipPackage />,
      'payment-management': <PaymentManagement />,
      'revenue-report': <RevenueReport />,
      'system-log': <SystemLog initialData={initialData.logs} />,
      'ai-statistics': <AIStatisticsReport />,
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

