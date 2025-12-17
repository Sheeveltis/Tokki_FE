'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Card,
  Space,
  Typography,
  Tag,
  Descriptions,
  Spin,
  Alert,
  Popconfirm,
  message,
} from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { statusUser } from '../../../../string.js'
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
import { ChatSupport } from '../../../live-chat/bubble-chat'
import { AutoEmail } from 'app/features/admin/screens/AutoEmail'
import { FeedbackInbox } from 'app/features/admin/screens/FeedbackInbox'
import { MembershipPackage } from 'app/features/admin/screens/MembershipPackage'
import { PaymentManagement } from 'app/features/admin/screens/PaymentManagement'
import { RevenueReport } from 'app/features/admin/screens/RevenueReport'
import { SystemLog } from 'app/features/admin/screens/SystemLog'
import { Settings } from 'app/features/admin/screens/Settings'
import { UpdateUserDetail } from './modal/UpdateUserDetail'
import { DeleteUserConfirm } from './modal/DeleteUserConfirm'

const { Title, Text } = Typography

export function UserDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const userId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab =
    tabParam === 'vocab'
      ? 'vocabulary-words'
      : tabParam === 'vocab-topics'
        ? 'vocabulary-topics'
        : tabParam || 'users-all'
  const [isPending, startTransition] = useTransition()

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
  const [detailUser, setDetailUser] = useState(null)
  const [showUpdate, setShowUpdate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

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
        // Error message đã được xử lý trong api/index.js với apiErrors
        if (mounted) setError(err?.message || 'Không thể tải dữ liệu người dùng.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const user = useMemo(
    () => (initialData.users || []).find((u) => u.id === userId),
    [initialData.users, userId],
  )

  useEffect(() => {
    if (user) {
      setDetailUser(user)
    }
  }, [user])

  const handleSaveEdit = (updated) => {
    setDetailUser(updated)
    message.success('Đã lưu chỉnh sửa (mock).')
    setShowUpdate(false)
  }

  const handleDelete = () => {
    message.success('Đã giả lập xoá người dùng.')
    setShowDelete(false)
  }

  const handleNavigate = (key) => {
    if (key) {
      startTransition(() => {
        router.push(`/admin?tab=${key}`)
      })
    }
  }

  const detailContent = (() => {
    if (loading) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Spin size="large" />
          <Text type="secondary">Đang tải người dùng...</Text>
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

    if (!detailUser) {
      return (
        <div style={{ padding: 24 }}>
          <Alert type="warning" message="Không tìm thấy người dùng" />
          <ButtonV2
            title="Quay lại danh sách"
            style={{ marginTop: 12, minWidth: 140 }}
            onPress={() => router.push('/admin')}
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
                Chi tiết người dùng
              </Title>
              <Text type="secondary">ID: {detailUser.id}</Text>
            </div>
            <Space>
              <ButtonV2
                title="Sửa"
                onPress={() => setShowUpdate(true)}
                color="poppy"
                style={{ minWidth: 80, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title="Xóa"
                color="charcoal"
                style={{ minWidth: 80, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
                onPress={() => setShowDelete(true)}
              />
              <ButtonV2
                title="Quay lại"
                color="mint"
                onPress={() => {
                  startTransition(() => {
                    router.push('/admin')
                  })
                }}
                style={{ minWidth: 80, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>

          <Card>
            <Descriptions column={1} bordered size="middle">
              <Descriptions.Item label="Tên">
                {detailUser.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {detailUser.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {detailUser.role || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={detailUser.status === 'Active' ? 'green' : 'red'} style={{ fontSize: '12px', padding: '2px 8px' }}>
                  {statusUser[detailUser.status] || detailUser.status || '-'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Space>
      </div>
    )
  })()

  // Memoize screens để tránh re-render không cần thiết
  const screens = useMemo(
    () => ({
      'users-all': detailContent,
      // Khi đang ở trang chi tiết, cả hai tab Users nên hiển thị chi tiết để tránh nhảy về bảng.
      'users-admin': detailContent,
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
      settings: <Settings />,
    }),
    [detailContent, initialData],
  )

  return (
    <>
      <AdminLayout
        screens={screens}
        defaultKey={defaultTab}
        onNavigate={handleNavigate}
        onLogout={() => router.push('/login')}
      />
      <UpdateUserDetail
        open={showUpdate}
        user={detailUser}
        onSave={handleSaveEdit}
        onCancel={() => setShowUpdate(false)}
      />
      <DeleteUserConfirm
        open={showDelete}
        user={detailUser}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  )
}

export default UserDetailScreen


