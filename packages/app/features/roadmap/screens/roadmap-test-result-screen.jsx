import { useEffect, useState, useCallback, useRef } from 'react'
import { Alert, Platform } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'
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
  const router = useRouter()
  const route = useRoute?.()
  const userExamId =
    Platform.OS === 'web'
      ? searchParams?.get?.('userExamId')
      : route?.params?.userExamId || searchParams?.get?.('userExamId')
  const targetAim =
    Platform.OS === 'web'
      ? Number(searchParams?.get?.('level'))
      : Number(route?.params?.level || searchParams?.get?.('level'))
  const selfDeclaredLevel =
    Platform.OS === 'web'
      ? Number(searchParams?.get?.('selfDeclaredLevel'))
      : Number(
          route?.params?.selfDeclaredLevel ||
            searchParams?.get?.('selfDeclaredLevel')
        )
  const isEntrance =
    Platform.OS === 'web'
      ? String(searchParams?.get?.('isEntrance') || '') === '1'
      : String(route?.params?.isEntrance || searchParams?.get?.('isEntrance') || '') === '1'
  const [resultData, setResultData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isGraded, setIsGraded] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackError, setFeedbackError] = useState(null)
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false)
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false)
  const [generateError, setGenerateError] = useState(null)
  const isGradedRef = useRef(false)
  const hasFetchedInitialRef = useRef(false)
  const feedbackRequestKeyRef = useRef(null)

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

  const fetchFeedback = useCallback(async () => {
    if (!isEntrance || !userExamId || !Number.isFinite(targetAim)) return null

    const requestKey = `${userExamId}-${targetAim}-${Number.isFinite(selfDeclaredLevel) ? selfDeclaredLevel : 0}`
    if (feedbackRequestKeyRef.current === requestKey && feedbackData) {
      return feedbackData
    }

    feedbackRequestKeyRef.current = requestKey
    setFeedbackLoading(true)
    setFeedbackError(null)
    try {
      const url = ENDPOINTS.ROADMAP.FEEDBACK
      const response = await apiClient.get(url, {
        params: {
          userExamId,
          targetAim,
          selfDeclaredLevel: Number.isFinite(selfDeclaredLevel)
            ? selfDeclaredLevel
            : 0,
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
  }, [isEntrance, userExamId, targetAim, selfDeclaredLevel, feedbackData])

  const handleGenerateRoadmap = useCallback(
    async ({ durationDays }) => {
      if (!isEntrance || !userExamId || !Number.isFinite(targetAim) || durationDays == null)
        return null

      setIsGeneratingRoadmap(true)
      setGenerateError(null)
      try {
        const url = ENDPOINTS.ROADMAP.GENERATE
        const response = await apiClient.post(url, {
          targetAim,
          durationDays,
          userExamId,
          selfDeclaredLevel: Number.isFinite(selfDeclaredLevel)
            ? selfDeclaredLevel
            : 0,
        }, {
          timeout: 0,
        })
        const roadmapId = response?.data?.data
        return roadmapId
      } catch (err) {
        console.error('Failed to generate roadmap:', err)
        try {
          const currentResponse = await apiClient.get(ENDPOINTS.ROADMAP.CURRENT)
          const currentRoadmap = currentResponse?.data?.data
          if (currentRoadmap?.userRoadmapId) {
            Alert.alert(
              'Bạn đã có lộ trình',
              'Bạn đã có lộ trình hiện tại. Bạn có muốn chuyển sang trang học không?',
              [
                { text: 'Ở lại', style: 'cancel' },
                {
                  text: 'Đi đến lộ trình',
                  onPress: () => router.push('/roadmap/learning'),
                },
              ]
            )
            return { hasExisting: true }
          }
        } catch (innerErr) {
          console.error('Failed to check current roadmap:', innerErr)
        }
        setGenerateError('Không thể tạo lộ trình. Vui lòng thử lại.')
        return null
      } finally {
        setIsGeneratingRoadmap(false)
      }
    },
    [isEntrance, userExamId, targetAim, router]
  )

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
        if (isEntrance) {
          await fetchFeedback()
          setIsDurationModalOpen(true)
        }
      }
    } catch (err) {
      console.error('Failed to check if exam is graded:', err)
      // Không set error để không làm gián đoạn UI
    }
  }, [userExamId, isEntrance, fetchResult, fetchFeedback])

  useEffect(() => {
    if (!userExamId) {
      setError('Thiếu thông tin bài thi.')
      setIsLoading(false)
      return
    }

    if (!hasFetchedInitialRef.current) {
      hasFetchedInitialRef.current = true
      fetchResult()
      if (isEntrance) {
        fetchFeedback()
      }
    }
  }, [userExamId, isEntrance, fetchResult, fetchFeedback])

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
      isEntrance={isEntrance}
      onNavigateToGenerate={() => {
        const query = `userExamId=${encodeURIComponent(userExamId)}&level=${targetAim}&selfDeclaredLevel=${selfDeclaredLevel}&isEntrance=1`
        router.push(`/roadmap/test/result/generate?${query}`)
      }}
    />
  )
}
