import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import { useSearchParams } from 'solito/navigation'
import { RoadmapTestResultLayout } from '../components/roadmap-test/roadmap-test-result-layout.web'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

let useRoute = null
try {
  const nav = require('@react-navigation/native')
  useRoute = nav.useRoute
} catch (_) {}

export function RoadmapTestResultScreen() {
  const searchParams = useSearchParams()
  const route = useRoute?.()
  const userExamId =
    Platform.OS === 'web'
      ? searchParams?.get?.('userExamId')
      : route?.params?.userExamId || searchParams?.get?.('userExamId')
  const [resultData, setResultData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isGraded, setIsGraded] = useState(false)
  const isGradedRef = useRef(false)

  const fetchResult = useCallback(async () => {
    if (!userExamId) return

    try {
      const url = ENDPOINTS.USER_EXAM.RESULT(userExamId)
      const response = await apiClient.get(url)
      const data = response?.data?.data
      if (data) {
        setResultData(data)
      } else {
        setError('Không thể tải kết quả bài thi.')
      }
    } catch (err) {
      console.error('Failed to fetch exam result:', err)
      setError('Không thể tải kết quả bài thi. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }, [userExamId])

  // Check if writing is graded
  const checkIsGraded = useCallback(async () => {
    if (!userExamId || isGradedRef.current) return

    try {
      const url = ENDPOINTS.USER_EXAM.IS_GRADED(userExamId)
      const response = await apiClient.get(url)
      const graded = response?.data === true || response?.data?.data === true
      
      if (graded) {
        isGradedRef.current = true
        setIsGraded(true)
        // Refresh result data when writing is graded
        await fetchResult()
      }
    } catch (err) {
      console.error('Failed to check if exam is graded:', err)
      // Không set error để không làm gián đoạn UI
    }
  }, [userExamId, fetchResult])

  useEffect(() => {
    if (!userExamId) {
      setError('Thiếu thông tin bài thi.')
      setIsLoading(false)
      return
    }

    fetchResult()
  }, [userExamId, fetchResult])

  // Poll for grading status every 10 seconds
  useEffect(() => {
    if (!userExamId) return

    // Check immediately
    checkIsGraded()

    // Then check every 10 seconds
    const interval = setInterval(() => {
      checkIsGraded()
    }, 10000) // 10 seconds

    return () => {
      clearInterval(interval)
    }
  }, [userExamId, checkIsGraded])

  return (
    <RoadmapTestResultLayout
      userExamId={userExamId}
      resultData={resultData}
      isLoading={isLoading}
      error={error}
      isGraded={isGraded}
    />
  )
}
