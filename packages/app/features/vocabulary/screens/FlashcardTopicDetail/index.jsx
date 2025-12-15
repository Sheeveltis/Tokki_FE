'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, Space, Typography, Spin, Alert } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from 'app/features/admin/components/admin-layout.web'
import { fetchFlashcardTopics, fetchVocabularies } from '../../api'
import TopicInfoCard from './components/topic-info-card'
import TopicVocabSection from './components/topic-vocab-section'

const { Title, Text } = Typography

export function FlashcardTopicDetailScreen() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const topicId = params?.id
  const tabParam = searchParams?.get('tab')
  const defaultTab = tabParam || 'vocabulary-topics'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topics, setTopics] = useState([])
  const [vocabList, setVocabList] = useState([])
  const [topicVocabIds, setTopicVocabIds] = useState([])
  const [selecting, setSelecting] = useState([])
  const [searching, setSearching] = useState(false)
  const [detailTopic, setDetailTopic] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [resTopics, resVocab] = await Promise.all([fetchFlashcardTopics(), fetchVocabularies()])
        if (mounted) {
          setTopics(resTopics || [])
          setVocabList(resVocab || [])
        }
      } catch (err) {
        if (mounted) setError(err?.message || 'Không thể tải chủ đề.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const topicItem = useMemo(() => topics.find((t) => t.id === topicId), [topics, topicId])

  useEffect(() => {
    if (topicItem) {
      setDetailTopic(topicItem)
      setTopicVocabIds(topicItem.vocabIds || [])
      setSelecting([])
    }
  }, [topicItem])

  const availableOptions = useMemo(
    () =>
      (vocabList || []).map((v) => ({
        label: `${v.text} - ${v.definition || ''}`,
        value: v.vocabularyId || v.id,
      })),
    [vocabList],
  )

  const handleSearchVocab = async (keyword) => {
    setSearching(true)
    try {
      const res = await fetchVocabularies(keyword)
      setVocabList(res || [])
    } finally {
      setSearching(false)
    }
  }

  const topicVocabData = useMemo(
    () =>
      topicVocabIds
        .map((id) => (vocabList || []).find((v) => v.vocabularyId === id || v.id === id))
        .filter(Boolean)
        .map((v) => ({ key: v.vocabularyId || v.id, ...v })),
    [topicVocabIds, vocabList],
  )

  const handleAddVocab = () => {
    if (!selecting?.length) return
    setTopicVocabIds((prev) => Array.from(new Set([...prev, ...selecting])))
    setSelecting([])
  }

  const handleNavigate = (key) => {
    if (key) router.push(`/admin?tab=${key}`)
  }

  const detailContent = (() => {
    if (loading) {
      return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Spin size="large" />
            <Text type="secondary">Đang tải chủ đề...</Text>
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

    if (!detailTopic) {
      return (
        <div style={{ padding: 24 }}>
          <Alert type="warning" message="Không tìm thấy chủ đề" />
          <ButtonV2
            title="Quay lại danh sách"
            style={{ marginTop: 12, minWidth: 140 }}
            onPress={() => router.push('/admin?tab=vocabulary-topics')}
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
                Chi tiết chủ đề flashcard
              </Title>
              <Text type="secondary">ID: {detailTopic.id}</Text>
            </div>
            <Space>
              <ButtonV2
                title="Quay lại"
                color="mint"
                onPress={() => router.push('/admin?tab=vocabulary-topics')}
                style={{ minWidth: 100, paddingVertical: 10 }}
                textStyle={{ fontSize: 14 }}
              />
            </Space>
          </Space>

          <TopicInfoCard topic={detailTopic} />
          <TopicVocabSection
            selecting={selecting}
            onSelectingChange={setSelecting}
            availableOptions={availableOptions}
            onSearch={handleSearchVocab}
            searching={searching}
            onAdd={handleAddVocab}
            dataSource={topicVocabData}
          />
        </Space>
      </div>
    )
  })()

  const screens = {
    'vocabulary-topics': detailContent,
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

export default FlashcardTopicDetailScreen

