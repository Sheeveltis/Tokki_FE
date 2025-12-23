'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, Space, Typography, Descriptions, Spin, Alert, Tag } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { statusArticle } from '../../../../string.js'
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
import { ChatSupport } from 'app/features/admin/screens/ChatSupport'
import { AutoEmail } from 'app/features/admin/screens/AutoEmail'
import { FeedbackInbox } from 'app/features/admin/screens/FeedbackInbox'
import { MembershipPackage } from 'app/features/admin/screens/MembershipPackage'
import { PaymentManagement } from 'app/features/admin/screens/PaymentManagement'
import { RevenueReport } from 'app/features/admin/screens/RevenueReport'
import { SystemLog } from 'app/features/admin/screens/SystemLog'
import { Settings } from 'app/features/admin/screens/Settings'

const { Title, Text } = Typography

export function BlogDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const blogId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab =
    tabParam === 'vocab'
      ? 'vocabulary-words'
      : tabParam === 'vocab-topics'
        ? 'vocabulary-topics'
        : tabParam || 'blog'

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
  const [detailBlog, setDetailBlog] = useState(null)

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
        if (mounted) setError(err?.message || 'Không thể tải dữ liệu bài viết.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const blog = useMemo(
    () => (initialData.articles || []).find((a) => a.id === blogId),
    [initialData.articles, blogId],
  )

  useEffect(() => {
    if (blog) {
      setDetailBlog(blog)
    }
  }, [blog])

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
          <Text type="secondary">Đang tải bài viết...</Text>
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

    if (!detailBlog) {
      return (
        <div style={{ padding: 24 }}>
          <Alert type="warning" message="Không tìm thấy bài viết" />
          <ButtonV2
            title="Quay lại danh sách"
            style={{ marginTop: 12, minWidth: 140 }}
            onPress={() => router.push('/admin?tab=blog')}
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
                Chi tiết bài viết
              </Title>
              <Text type="secondary">ID: {detailBlog.id}</Text>
            </div>
            <Space>
              <ButtonV2
                title="Quay lại"
                color="mint"
                onPress={() => router.push('/admin?tab=blog')}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>

          <Card>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Tiêu đề">{detailBlog.title || '-'}</Descriptions.Item>
              <Descriptions.Item label="Tác giả">{detailBlog.author || '-'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={detailBlog.published ? 'green' : 'orange'} style={{ fontSize: '12px', padding: '2px 8px' }}>
                  {detailBlog.published ? statusArticle.published : statusArticle.draft}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      </div>
    )
  })()

  const screens = {
    'users-all': <UserManagement mode="all" initialData={initialData.users} />,
    'users-admin': <UserManagement mode="admin" initialData={initialData.users} />,
    lessons: <LessonManagement initialData={initialData.lessons} />,
    'vocabulary-words': <VocabularyManagement initialData={initialData.vocab} />,
    'vocabulary-topics': <FlashcardTopicManagement initialData={initialData.vocabTopics} />,
    blog: detailContent,
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

export default BlogDetailScreen

