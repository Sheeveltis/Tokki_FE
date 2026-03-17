import { useEffect, useState, useCallback } from 'react'
import { RoadmapLearningLayout } from '../components/roadmap-learning/roadmap-learning-layout.web'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

// Screen hiển thị lộ trình học theo ngày cho từng kỹ năng (nghe/đọc/viết)
export function RoadmapLearningScreen() {
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
      console.error('Failed to fetch current roadmap:', err)
      setError('Không thể tải lộ trình hiện tại. Vui lòng thử lại.')
      setRoadmapData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
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

