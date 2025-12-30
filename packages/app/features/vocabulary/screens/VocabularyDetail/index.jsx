'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'solito/navigation'
import { Space, Typography, Spin, Alert } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from 'app/features/admin/components/admin-layout.web'
import { fetchUsers, fetchLessons, fetchArticles, fetchSystemLogs } from 'app/features/admin/api'
import { fetchVocabularies, fetchFlashcardTopics, updateVocabulary } from '../../api'
import { UserManagement } from 'app/features/admin/screens/UserManagement'
import { LessonManagement } from 'app/features/admin/screens/LessonManagement'
import { VocabularyManagement } from '../VocabularyManagement'
import { FlashcardTopicManagement } from '../FlashcardTopicManagement'
import { BlogManagement } from 'app/features/blog/blog-management'
import { ChatSupport } from '../../../live-chat/chat-support'
import { AutoEmail } from 'app/features/admin/screens/AutoEmail'
import { FeedbackInbox } from 'app/features/admin/screens/FeedbackInbox'
import { MembershipPackage } from 'app/features/admin/screens/MembershipPackage'
import { PaymentManagement } from 'app/features/admin/screens/PaymentManagement'
import { RevenueReport } from 'app/features/admin/screens/RevenueReport'
import { SystemLog } from 'app/features/admin/screens/SystemLog'
import { Settings } from 'app/features/admin/screens/Settings'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin.jsx'
import VocabularyEditModal from './components/vocabulary-edit-modal'
import VocabularyInfoCard from './components/vocabulary-info-card'

const { Title, Text } = Typography

export function VocabularyDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const vocabId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab =
    tabParam === 'vocab'
      ? 'vocabulary-words'
      : tabParam === 'vocab-topics'
        ? 'vocabulary-topics'
        : tabParam || 'vocabulary-words'

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
  const [detailVocab, setDetailVocab] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [users, lessons, vocabResult, vocabTopics, articles, logs] = await Promise.all([
          fetchUsers(),
          fetchLessons(),
          fetchVocabularies({ pageNumber: 1, pageSize: 1000 }), // Lấy nhiều items để tìm kiếm
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

  const vocabItem = useMemo(() => {
    const vocabList = Array.isArray(initialData.vocab) ? initialData.vocab : []
    return vocabList.find((v) => v.vocabularyId === vocabId || v.id === vocabId)
  }, [initialData.vocab, vocabId])

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

  const handleUpdate = async (values) => {
    try {
      setEditLoading(true)
      const vocabularyId = detailVocab?.vocabularyId || detailVocab?.id
      if (!vocabularyId) {
        showAdminError('Không tìm thấy ID từ vựng')
        return
      }

      // Chỉ gửi các field mà API yêu cầu
      const payload = {
        vocabularyId,
        text: values?.text || '',
        pronunciation: values?.pronunciation || '',
        definition: values?.definition || '',
        imgURL: values?.imgURL || null,
      }

      // Đảm bảo definition không rỗng
      if (!payload.definition) {
        showAdminError('Vui lòng nhập định nghĩa')
        return
      }

      const updated = await updateVocabulary(payload)
      
      // Cập nhật state với dữ liệu mới
      setDetailVocab({
        ...detailVocab,
        ...updated,
        vocabularyId: updated?.vocabularyId || vocabularyId,
        id: updated?.vocabularyId || vocabularyId,
      })
      
      showAdminSuccess('Đã cập nhật từ vựng thành công')
      setEditOpen(false)
    } catch (err) {
      // err có thể là response object từ API hoặc error object
      if (err?.isSuccess === false || err?.errors) {
        // Là response từ API với lỗi
        const errorMessage = err?.message || err?.errors?.[0]?.description || 'Cập nhật từ vựng thất bại'
        showAdminError(errorMessage, err?.statusCode)
      } else {
        // Là error khác
        showAdminError(err?.message || 'Cập nhật từ vựng thất bại')
      }
    } finally {
      setEditLoading(false)
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
          <ButtonV2 title="Quay lại Admin" style={{ marginTop: 10, minWidth: 120 }} onPress={() => router.push('/admin')} />
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
            onPress={() => router.push('/admin?tab=vocabulary-words')}
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
              <Text type="secondary">ID: {detailVocab.vocabularyId || detailVocab.id}</Text>
            </div>
            <Space>
              <ButtonV2
                title="Chỉnh sửa"
                color="poppy"
                onPress={() => setEditOpen(true)}
                style={{ minWidth: 110, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title="Xóa"
                color="charcoal"
                onPress={() => {
                  // TODO: hook up delete API/confirm
                }}
                style={{ minWidth: 90, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
              <ButtonV2
                title="Quay lại"
                color="mint"
                onPress={() => router.push('/admin?tab=vocabulary-words')}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>

          <VocabularyInfoCard vocab={detailVocab} />
          <VocabularyEditModal
            open={editOpen}
            loading={editLoading}
            initialValues={detailVocab || {}}
            onCancel={() => setEditOpen(false)}
            onSubmit={handleUpdate}
          />
        </Space>
      </div>
    )
  })()

  const screens = {
    'users-all': <UserManagement mode="all" initialData={initialData.users} />,
    'users-admin': <UserManagement mode="admin" initialData={initialData.users} />,
    lessons: <LessonManagement initialData={initialData.lessons} />,
    'vocabulary-words': detailContent,
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

export default VocabularyDetailScreen

