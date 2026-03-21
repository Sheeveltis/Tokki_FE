import { useEffect, useState, useCallback, useRef } from 'react'
import { RoadmapLearningLayout } from '../components/roadmap-learning/roadmap-learning-layout.web'
import { apiClient, getAuthToken } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

// Screen hiển thị lộ trình học theo ngày cho từng kỹ năng (nghe/đọc/viết)
export function RoadmapLearningScreen() {
  const [roadmapData, setRoadmapData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const hasFetchedRef = useRef(false)

  const fetchCurrentRoadmap = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setIsLoading(false)
      setRoadmapData(null)
      setError('Bạn cần đăng nhập để xem lộ trình học.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.get(ENDPOINTS.ROADMAP.CURRENT)
      const data = response?.data?.data || null
      setRoadmapData(data)
    } catch (err) {
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
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchCurrentRoadmap()
  }, [fetchCurrentRoadmap])

  return (
    <RoadmapLearningLayout
      roadmapData={roadmapData}
      isLoading={isLoading}
      error={error}
      onRetry={fetchCurrentRoadmap}
    />
  )
}

