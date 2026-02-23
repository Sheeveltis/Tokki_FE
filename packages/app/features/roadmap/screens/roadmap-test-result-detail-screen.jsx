import React, { useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'
import { useSearchParams } from 'solito/navigation'
import { apiClient } from '../../../provider/api/client'
import { RoadmapTestResultDetailLayout } from '../components/roadmap-test/roadmap-test-result-detail-layout.web'

let useRoute = null
try {
  const nav = require('@react-navigation/native')
  useRoute = nav.useRoute
} catch (_) {}

const normalizeSection = (raw) => {
  const s = String(raw || '').toLowerCase().trim()
  if (s === 'listening' || s === 'reading' || s === 'writing') return s
  return null
}

export function RoadmapTestResultDetailScreen() {
  const searchParams = useSearchParams()
  const route = useRoute?.()

  const userExamId =
    Platform.OS === 'web'
      ? searchParams?.get?.('userExamId')
      : route?.params?.userExamId || searchParams?.get?.('userExamId')

  const sectionRaw =
    Platform.OS === 'web'
      ? searchParams?.get?.('section')
      : route?.params?.section || searchParams?.get?.('section')

  const section = useMemo(() => normalizeSection(sectionRaw), [sectionRaw])

  const [detailData, setDetailData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userExamId || !section) {
      setError('Thiếu thông tin chi tiết bài thi.')
      setIsLoading(false)
      return
    }

    const fetchDetail = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const url = `/UserExam/${encodeURIComponent(userExamId)}/result/${encodeURIComponent(section)}`
        const response = await apiClient.get(url)
        const data = response?.data?.data
        if (!data) throw new Error('Empty detail data')
        setDetailData(data)
      } catch (err) {
        console.error('Failed to fetch section result detail:', err)
        setError('Không thể tải chi tiết phần này. Vui lòng thử lại.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [userExamId, section])

  return (
    <RoadmapTestResultDetailLayout
      userExamId={userExamId}
      section={section}
      detailData={detailData}
      isLoading={isLoading}
      error={error}
    />
  )
}

