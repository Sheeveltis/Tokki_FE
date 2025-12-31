'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'solito/navigation'
import { Card, Space, Typography, Descriptions, Spin, Alert, message } from 'antd'
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

const { Title, Text } = Typography

export function LessonDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const lessonId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab =
    tabParam === 'vocab'
      ? 'vocabulary-words'
      : tabParam === 'vocab-topics'
        ? 'vocabulary-topics'
        : tabParam || 'lessons'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialData, setInitialData] = useState({
    users: [],
    lessons: [],
    vocab: [],
    vocabTopics: [],
    articles: [],
    logs: [],
  })
  const [detailLesson, setDetailLesson] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [users, lessons, vocabResult, vocabTopics, articles, logs] = await Promise.all([
          fetchUsers(),
          fetchLessons(),
          fetchVocabularies({ pageNumber: 1, pageSize: 1000 }),
          fetchFlashcardTopics(),
          fetchArticles(),
          fetchSystemLogs(),
        ])
        if (mounted) {
          // fetchVocabularies trả về object { items, ... }, cần lấy items
          const vocab = Array.isArray(vocabResult?.items) ? vocabResult.items : []
          setInitialData({ users: users || [], lessons, vocab, vocabTopics, articles, logs })
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Không thể tải dữ liệu bài học.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const lesson = useMemo(
    () => (initialData.lessons || []).find((l) => l.id === lessonId),
    [initialData.lessons, lessonId],
  )

  useEffect(() => {
    if (lesson) {
      setDetailLesson(lesson)
    }
  }, [lesson])

  const handleNavigate = (key) => {
    if (key) {
      router.push(`/admin?tab=${key}`)
    }
  }

  const detailContent = (() => {
    if (loading) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Spin size="large" />
          <Text type="secondary">Đang tải bài học...</Text>
        </div>
      )
    }

    if (error) {
      return (
        <div style={{ padding: 24 }}>
          <Alert type="error" message="Lỗi" description={error} />
          <ButtonV2
            title="Quay lại Admin"
            style={{ marginTop: 10, minWidth: 120 }}
            onPress={() => router.push('/admin')}
          />
        </div>
      )
    }

    if (!detailLesson) {
      return (
        <div style={{ padding: 24 }}>
          <Alert type="warning" message="Không tìm thấy bài học" />
          <ButtonV2
            title="Quay lại danh sách"
            style={{ marginTop: 12, minWidth: 140 }}
            onPress={() => router.push('/admin?tab=lessons')}
          />
        </div>
      )
    }

    return (
      <div style={{ padding: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <div>
              <Title level={3} style={{ marginBottom: 4 }}>
                Chi tiết bài học
              </Title>
              <Text type="secondary">ID: {detailLesson.id}</Text>
            </div>
            <Space>
              <ButtonV2
                title="Quay lại"
                color="mint"
                onPress={() => router.push('/admin?tab=lessons')}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>

          <Card>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Tiêu đề">{detailLesson.title || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tác giả">{detailLesson.author || '-'}</Descriptions.Item>
              <Descriptions.Item label="Cập nhật">{detailLesson.updatedAt || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      </div>
    )
  })()

  const screens = {
    'users-all': <UserManagement mode="all" initialData={initialData.users} />,
    'users-admin': <UserManagement mode="admin" initialData={initialData.users} />,
    lessons: detailContent,
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
    settings: <Settings />,
  }

  return (
    <AdminLayout
      screens={screens}
      defaultKey={defaultTab}
      onNavigate={handleNavigate}
      onLogout={() => router.push('/login')}
    />
  )
}

export default LessonDetailScreen


