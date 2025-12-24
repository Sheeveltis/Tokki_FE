'use client'

import React, { useEffect, useState, useMemo, useTransition } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { StaffLayout } from './components/staff-layout.web'
import {
  fetchRegularUsers,
  fetchLessons,
  fetchVocabularies,
  fetchFlashcardTopics,
  fetchArticles,
} from './api'
// Reuse screens từ admin
import { LessonManagement } from '../admin/screens/LessonManagement'
import { VocabularyManagement } from '../vocabulary/screens/VocabularyManagement'
import { FlashcardTopicManagement } from '../vocabulary/screens/FlashcardTopicManagement'
import { BlogManagement } from '../blog/blog-management'
// import { ChatSupport } from '../admin/screens/ChatSupport'
// import { AutoEmail } from '../admin/screens/AutoEmail'
// import { FeedbackInbox } from '../admin/screens/FeedbackInbox'
// // Staff-specific screens
// import { UserManagement } from './screens/UserManagement'
// import { Settings } from './screens/Settings'

export function StaffScreen() {
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
  })

  useEffect(() => {
    let mounted = true
    const loadAll = async () => {
      try {
        const [users, lessons, vocabResult, vocabTopics, articles] = await Promise.all([
          fetchRegularUsers(),
          fetchLessons(),
          fetchVocabularies({ pageNumber: 1, pageSize: 1000 }),
          fetchFlashcardTopics(),
          fetchArticles(),
        ])
        if (mounted) {
          // fetchVocabularies trả về object { items, ... }, cần lấy items
          const vocab = Array.isArray(vocabResult?.items) ? vocabResult.items : []
          setInitialData({ users, lessons, vocab, vocabTopics, articles })
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu staff:', error.message)
        if (mounted) {
          setInitialData({ users: [], lessons: [], vocab: [], vocabTopics: [], articles: [] })
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
      users: <UserManagement initialData={initialData.users} />,
      lessons: <LessonManagement initialData={initialData.lessons} />,
      'vocabulary-words': <VocabularyManagement initialData={initialData.vocab} />,
      'vocabulary-topics': <FlashcardTopicManagement initialData={initialData.vocabTopics} />,
      blog: <BlogManagement initialData={initialData.articles} />,
      'chat-support': <ChatSupport initialData={initialData.users} />,
      'auto-email': <AutoEmail />,
      'feedback-inbox': <FeedbackInbox />,
      settings: <Settings />,
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

