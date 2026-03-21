import React, { useCallback, useEffect, useState } from 'react'
import { RoadmapTipsLayout } from '../components/roadmap-practice-test/roadmap-tips-layout.web'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

// Trang hiển thị nội dung lý thuyết theo task roadmap
export function RoadmapTipsScreen({ tipId }) {
  const [taskDetail, setTaskDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTaskDetail = useCallback(async () => {
    if (!tipId) {
      setTaskDetail(null)
      setError('Không tìm thấy bài học.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get(ENDPOINTS.ROADMAP.TASK_DETAIL(tipId))
      const data = response?.data?.data || null
      setTaskDetail(data)
    } catch (err) {
      console.error('Failed to fetch roadmap task detail:', err)
      setTaskDetail(null)
      setError('Không thể tải nội dung chi tiết. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [tipId])

  const handleCompleteTask = useCallback(async () => {
    if (!tipId) return
    try {
      await apiClient.post(ENDPOINTS.ROADMAP.COMPLETE, {
        taskId: tipId,
        performance: 'string', // Theo schema API
      })
      // Cập nhật state tại chỗ để UI phản hồi ngay
      setTaskDetail((prev) => (prev ? { ...prev, isCompleted: true } : prev))
    } catch (err) {
      console.error('Failed to mark task as complete:', err)
      alert('Không thể đánh dấu hoàn thành. Vui lòng thử lại.')
    }
  }, [tipId])

  useEffect(() => {
    fetchTaskDetail()
  }, [fetchTaskDetail])

  return (
    <RoadmapTipsLayout
      tipId={tipId}
      taskDetail={taskDetail}
      isLoading={isLoading}
      error={error}
      onRetry={fetchTaskDetail}
      onComplete={handleCompleteTask}
    />
  )
}