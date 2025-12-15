'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, Space, Typography, Descriptions, Spin, Alert } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from 'app/features/admin/components/admin-layout.web'
import {
  fetchUsers,
  fetchLessons,
  fetchVocabularies,
  fetchArticles,
  fetchSystemLogs,
} from 'app/features/admin/api'
import { UserManagement } from 'app/features/admin/screens/UserManagement'
import { LessonManagement } from 'app/features/admin/screens/LessonManagement'
import { VocabularyManagement } from 'app/features/admin/screens/VocabularyManagement'
import { BlogManagement } from 'app/features/blog/blog-management'
import { ChatSupport } from '../../../live-chat/bubble-chat'
import { AutoEmail } from 'app/features/admin/screens/AutoEmail'
import { FeedbackInbox } from 'app/features/admin/screens/FeedbackInbox'
import { MembershipPackage } from 'app/features/admin/screens/MembershipPackage'
import { PaymentManagement } from 'app/features/admin/screens/PaymentManagement'
import { RevenueReport } from 'app/features/admin/screens/RevenueReport'
import { SystemLog } from 'app/features/admin/screens/SystemLog'
import { Settings } from 'app/features/admin/screens/Settings'

const { Title, Text } = Typography

export function VocabularyDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const vocabId = params?.id
  const defaultTab = searchParams?.get('tab') || 'vocab'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialData, setInitialData] = useState({
    users: [],
    lessons: [],
    vocab: [],
    articles: [],
    logs: [],
  })
  const [detailVocab, setDetailVocab] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [users, lessons, vocab, articles, logs] = await Promise.all([
          fetchUsers(),
          fetchLessons(),
          fetchVocabularies(),
          fetchArticles(),
          fetchSystemLogs(),
        ])
        if (mounted) {
          setInitialData({ users: users || [], lessons, vocab, articles, logs })
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Không thể tải dữ liệu từ vựng.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const vocabItem = useMemo(
    () => (initialData.vocab || []).find((v) => v.id === vocabId),
    [initialData.vocab, vocabId],
  )

  useEffect(() => {
    if (vocabItem) {
      setDetailVocab(vocabItem)
    }
  }, [vocabItem])

  const handleNavigate = (key) => {
    if (key) {
      router.push(`/admin?tab=${key}`)
    }
  }

  const detailContent = (() => {
    if (loading) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Spin size="large" />
            <Text type="secondary">Đang tải từ vựng...</Text>
          </div>
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

    if (!detailVocab) {
      return (
        <div style={{ padding: 24 }}>
          <Alert type="warning" message="Không tìm thấy từ vựng" />
          <ButtonV2
            title="Quay lại danh sách"
            style={{ marginTop: 12, minWidth: 140 }}
            onPress={() => router.push('/admin?tab=vocab')}
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
                Chi tiết từ vựng
              </Title>
              <Text type="secondary">ID: {detailVocab.id}</Text>
            </div>
            <Space>
              <ButtonV2
                title="Quay lại"
                color="mint"
                onPress={() => router.push('/admin?tab=vocab')}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>

          <Card>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Từ">{detailVocab.word || '-'}</Descriptions.Item>
              <Descriptions.Item label="Nghĩa">{detailVocab.meaning || '-'}</Descriptions.Item>
              <Descriptions.Item label="Level">{detailVocab.level || '-'}</Descriptions.Item>
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
    vocab: detailContent,
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

export default VocabularyDetailScreen


