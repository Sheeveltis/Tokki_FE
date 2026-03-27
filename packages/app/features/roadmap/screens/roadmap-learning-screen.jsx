import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Platform } from 'react-native'
import { useSearchParams } from 'solito/navigation'
import { RoadmapLearningLayout } from '../components/roadmap-learning/roadmap-learning-layout.web'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

// Screen hiển thị lộ trình học tập - Đồng bộ hóa trạng thái với URL parameters
export function RoadmapLearningScreen() {
  const searchParams = useSearchParams()
  
  // Đồng bộ index tuần/ngày từ URL
  const weekIndexFromUrl = useMemo(() => {
    const val = searchParams?.get?.('week')
    return val ? parseInt(val) : null
  }, [searchParams])

  const dayIndexFromUrl = useMemo(() => {
    const val = searchParams?.get?.('day')
    return val ? parseInt(val) : null
  }, [searchParams])

  const [roadmapData, setRoadmapData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCurrentRoadmap = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get(ENDPOINTS.ROADMAP.CURRENT)
      const data = response?.data?.data || null
      setRoadmapData(data)
    } catch (err) {
      console.error('Failed to fetch roadmap:', err)
      const status = err?.response?.status
      if (status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      } else {
        setError('Không thể tải lộ trình hiện tại. Vui lòng thử lại.')
      }
      setRoadmapData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentRoadmap()

    // Re-fetch khi window quay lại focus (ví dụ sau khi học xong ở tab khác hoặc quay lại trình duyệt)
    if (Platform.OS === 'web') {
      const onFocus = () => fetchCurrentRoadmap()
      window.addEventListener('focus', onFocus)
      return () => window.removeEventListener('focus', onFocus)
    }
  }, [fetchCurrentRoadmap])

  return (
    <RoadmapLearningLayout
      roadmapData={roadmapData}
      isLoading={isLoading}
      error={error}
      onRetry={fetchCurrentRoadmap}
      initialWeekIndex={weekIndexFromUrl}
      initialDayIndex={dayIndexFromUrl}
    />
  )
}



