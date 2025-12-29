'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, Space, Typography, Spin, Alert } from 'antd'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { AdminLayout } from 'app/features/admin/components/admin-layout.web'
import {
  fetchFlashcardTopicDetail,
  searchVocabulariesForTopic,
  addVocabulariesToTopicAndReload,
  removeVocabulariesFromTopicAndReload,
} from '../../api'
import { HelperAdmin } from '../../../../../components/HelperAdmin.jsx'
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
  const [searchVocabList, setSearchVocabList] = useState([]) // Danh sách từ vựng từ API search (để thêm vào chủ đề)
  const [topicVocabularies, setTopicVocabularies] = useState([]) // Danh sách từ vựng đã có trong chủ đề
  const [topicVocabIds, setTopicVocabIds] = useState([])
  const [selecting, setSelecting] = useState([])
  const [removingKeys, setRemovingKeys] = useState([])
  const [searching, setSearching] = useState(false)
  const [detailTopic, setDetailTopic] = useState(null)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const resDetail = await fetchFlashcardTopicDetail(topicId)
        if (mounted && resDetail?.topic) {
          setDetailTopic(resDetail.topic)
          setTopicVocabIds(resDetail.topic.vocabIds || [])
          setTopicVocabularies(resDetail.vocabularies || []) // Lưu danh sách từ vựng đã có trong chủ đề
          setSearchVocabList([]) // Reset danh sách search
          setSelecting([])
          setRemovingKeys([])
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
  }, [topicId])

  const availableOptions = useMemo(() => {
    // Chỉ hiển thị các từ vựng từ kết quả search (không phải từ vựng đã có trong chủ đề)
    const safeSearchVocabList = Array.isArray(searchVocabList) ? searchVocabList : []
    return safeSearchVocabList.map((v) => ({
      label: `${v.text} - ${v.definition || ''}`,
      value: v.vocabularyId || v.id,
    }))
  }, [searchVocabList])

  const handleSearchVocab = async (keyword) => {
    // Clear timeout trước đó nếu có
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce: đợi 300ms sau khi người dùng ngừng gõ
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        // Sử dụng function API đã được tách ra
        const items = await searchVocabulariesForTopic(keyword, { pageSize: 10 })
        // Cập nhật danh sách từ vựng từ API search (để hiển thị trong Select)
        setSearchVocabList(items)
      } catch (err) {
        console.error('Error searching vocabularies:', err)
        setSearchVocabList([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }

  // Tự động load 10 từ vựng đầu tiên khi focus vào Select
  const handleSelectFocus = () => {
    // Chỉ load nếu danh sách đang trống
    if (searchVocabList.length === 0 && !searching) {
      handleSearchVocab('')
    }
  }

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleRemoveVocab = async () => {
    if (!removingKeys?.length || !topicId) return

    setRemoving(true)
    setApiResponse(null)

    try {
      const { response, topicDetail } = await removeVocabulariesFromTopicAndReload(topicId, removingKeys)
      setApiResponse(response)

      if (response?.isSuccess && topicDetail?.topic) {
        setDetailTopic(topicDetail.topic)
        setTopicVocabIds(topicDetail.topic.vocabIds || [])
        setTopicVocabularies(topicDetail.vocabularies || [])
        setRemovingKeys([])
      }
    } catch (err) {
      console.error('Error removing vocabularies:', err)
      setApiResponse({
        isSuccess: false,
        message: err?.message || 'Không thể gỡ từ vựng khỏi chủ đề',
        errors: err?.errors || [],
        statusCode: err?.statusCode || 500,
      })
    } finally {
      setRemoving(false)
    }
  }

  const topicVocabData = useMemo(() => {
    // Sử dụng topicVocabularies (danh sách từ vựng đã có trong chủ đề) thay vì searchVocabList
    const safeTopicVocabularies = Array.isArray(topicVocabularies) ? topicVocabularies : []
    const safeTopicVocabIds = Array.isArray(topicVocabIds) ? topicVocabIds : []
    
    // Lọc và map các từ vựng theo topicVocabIds
    return safeTopicVocabIds
      .map((id) => safeTopicVocabularies.find((v) => v.vocabularyId === id || v.id === id))
      .filter(Boolean)
      .map((v) => ({ key: v.vocabularyId || v.id, ...v }))
  }, [topicVocabIds, topicVocabularies])

  const handleAddVocab = async () => {
    if (!selecting?.length || !topicId) return
    
    setAdding(true)
    setApiResponse(null)
    
    try {
      // Sử dụng function API đã được tách ra với logic reload
      const { response, topicDetail } = await addVocabulariesToTopicAndReload(topicId, selecting)
      setApiResponse(response)
      
      // Nếu thành công và có topicDetail, cập nhật state
      if (response?.isSuccess && topicDetail?.topic) {
        setDetailTopic(topicDetail.topic)
        setTopicVocabIds(topicDetail.topic.vocabIds || [])
        setTopicVocabularies(topicDetail.vocabularies || [])
        
        // Reset selection và danh sách search
        setSelecting([])
        setSearchVocabList([])
      }
    } catch (err) {
      console.error('Error adding vocabularies:', err)
      setApiResponse({
        isSuccess: false,
        message: err?.message || 'Không thể thêm từ vựng vào chủ đề',
        errors: err?.errors || [],
        statusCode: err?.statusCode || 500,
      })
    } finally {
      setAdding(false)
    }
  }

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

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

          <HelperAdmin response={apiResponse} />
          <TopicInfoCard topic={detailTopic} />
          <TopicVocabSection
            selecting={selecting}
            onSelectingChange={setSelecting}
            removingKeys={removingKeys}
            onRemovingKeysChange={setRemovingKeys}
            availableOptions={availableOptions}
            onSearch={handleSearchVocab}
            onFocus={handleSelectFocus}
            searching={searching}
            onAdd={handleAddVocab}
            adding={adding}
            onRemove={handleRemoveVocab}
            removing={removing}
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



