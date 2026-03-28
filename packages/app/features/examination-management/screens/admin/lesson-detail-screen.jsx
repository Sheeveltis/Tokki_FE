'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'solito/navigation'
import { Card, Space, Typography, Descriptions, Spin, Alert, message, Button } from 'antd'
import { AdminLayout } from 'app/features/back-office/components/admin/admin-layout.web.jsx'
import { StaffLayout } from 'app/features/back-office/components/staff/staff-layout.web.jsx'
import { ModeratorLayout } from 'app/features/moderator/components/moderator-layout.web'
import {
  fetchUsers,
  fetchLessons,
  fetchArticles,
  fetchSystemLogs,
} from 'app/features/back-office/api/admin-index.js'
import { fetchVocabularies, fetchFlashcardTopics } from 'app/features/vocabulary/api'
import { UserManagement } from 'app/features/user/screens/admin/user-management-screen.jsx'
import { LessonManagement } from './lesson-management-screen'
import { VocabularyManagement } from '@tokki/app/features/vocabulary/screens/admin/vocabulary-management-screen'
import { FlashcardTopicManagement } from 'app/features/vocabulary/screens/admin/vocab-topic-management-screen.jsx'
import { BlogManagement } from 'app/features/blog/screens/admin/blog-management-screen'
import { ChatSupportScreen } from '../../../customer-service-management/screens/chat-support-screen.jsx'
import { AutoEmail } from 'app/features/customer-service-management/screens/auto-email-screen.jsx'
import { FeedbackInbox } from '@tokki/app/features/customer-service-management/screens/feedback-inbox-screen'
import { MembershipPackage } from 'app/features/revenue-management/screens/membership-package-screen.jsx'
import { PaymentManagement } from 'app/features/revenue-management/screens/payment-management.jsx'
import { RevenueReport } from 'app/features/revenue-management/screens/revenue-report-screen.jsx'
import { SystemLog } from 'app/features/system/screens/system-log.jsx'
import { Settings } from 'app/features/system/screens/setting-screen.jsx'

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

  // Xác định cổng hiện tại dựa vào URL
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
    if (pathname === '/moderator' || pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }
  
  const currentPortal = getCurrentPortal()

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
    if (!key) return
    if (currentPortal === 'staff') {
      router.push(`/staff?tab=${key}`)
    } else if (currentPortal === 'moderator') {
      router.push(`/moderator?tab=${key}`)
    } else {
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
          <Button
            onClick={() => router.back()}
            style={{ marginTop: 10, height: 'auto', padding: '8px 24px' }}
          >
            Quay lại
          </Button>
        </div>
      )
    }

    if (!detailLesson) {
      return (
        <div style={{ padding: 24 }}>
          <Alert type="warning" message="Không tìm thấy bài học" />
          <Button
            onClick={() => router.back()}
            style={{ marginTop: 12, height: 'auto', padding: '8px 24px' }}
          >
            Quay lại danh sách
          </Button>
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
              <Button
                onClick={() => router.back()}
                style={{ height: 'auto', padding: '8px 24px', backgroundColor: '#BCD0CA', borderColor: '#BCD0CA', color: '#373039' }}
              >
                Quay lại
              </Button>
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

  return detailContent
}

export default LessonDetailScreen

