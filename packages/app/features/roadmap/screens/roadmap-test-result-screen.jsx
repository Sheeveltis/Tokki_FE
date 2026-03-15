import { useEffect, useState, useCallback, useRef } from 'react'
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
  const targetAim =
    Platform.OS === 'web'
      ? Number(searchParams?.get?.('level'))
      : Number(route?.params?.level || searchParams?.get?.('level'))
  const [resultData, setResultData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isGraded, setIsGraded] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState(null)
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false)
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

  const fetchAnalysis = useCallback(async () => {
    if (!userExamId) return

    setAnalysisLoading(true)
    try {
      const url = ENDPOINTS.USER_EXAM.ANALYSIS(userExamId)
      const response = await apiClient.get(url)
      const data = response?.data?.data || null
      setAnalysisData(data)
      return data
    } catch (err) {
      console.error('Failed to fetch exam analysis:', err)
      setAnalysisData(null)
      return null
    } finally {
      setAnalysisLoading(false)
    }
  }, [userExamId])

  const fetchFeedback = useCallback(async () => {
    if (!userExamId || !targetAim) return

    setFeedbackLoading(true)
    setFeedbackError(null)
    try {
      const url = ENDPOINTS.ROADMAP.FEEDBACK
      const response = await apiClient.get(url, {
        params: {
          userExamId,
          targetAim,
        },
      })
      const data = response?.data?.data || null
      setFeedbackData(data)
      return data
    } catch (err) {
      console.error('Failed to fetch roadmap feedback:', err)
      setFeedbackData(null)
      setFeedbackError('Không thể tải thông tin phản hồi. Vui lòng thử lại.')
      return null
    } finally {
      setFeedbackLoading(false)
    }
  }, [userExamId, targetAim])

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
        await fetchAnalysis()
        await fetchFeedback()
        setIsDurationModalOpen(true)
      }
    } catch (err) {
      console.error('Failed to check if exam is graded:', err)
      // Không set error để không làm gián đoạn UI
    }
  }, [userExamId, fetchResult, fetchAnalysis, fetchFeedback])

  useEffect(() => {
    if (!userExamId) {
      setError('Thiếu thông tin bài thi.')
      setIsLoading(false)
      return
    }

    fetchResult()
    fetchAnalysis()
    fetchFeedback()
  }, [userExamId, fetchResult, fetchAnalysis, fetchFeedback])

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
      analysisData={analysisData}
      analysisLoading={analysisLoading}
      feedbackData={feedbackData}
      feedbackLoading={feedbackLoading}
      feedbackError={feedbackError}
      isDurationModalOpen={isDurationModalOpen}
      onOpenDurationModal={() => setIsDurationModalOpen(true)}
      onCloseDurationModal={() => setIsDurationModalOpen(false)}
    />
  )
}
