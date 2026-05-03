import { useEffect, useState, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import { useSearchParams } from 'solito/navigation'
import { RoadmapGenerateLayout } from '../components/roadmap-test/roadmap-generate-layout.web'
import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

let useRoute = null
try {
  const nav = require('@react-navigation/native')
  useRoute = nav.useRoute
} catch (_) { }

export function RoadmapGenerateScreen() {
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



  const isEntrance =
    Platform.OS === 'web'
      ? String(searchParams?.get?.('isEntrance') || '') === '1'
      : String(route?.params?.isEntrance || searchParams?.get?.('isEntrance') || '') === '1'

  const [feedbackData, setFeedbackData] = useState(null)
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [feedbackError, setFeedbackError] = useState(null)
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false)
  const [generateError, setGenerateError] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const hasFetchedRef = useRef(false)
  const pollIntervalRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const pollProgress = useCallback(
    async (jobId) => {
      stopPolling()
      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await apiClient.get(ENDPOINTS.ROADMAP.PROGRESS(jobId))
          const data = response?.data
          setProgressData(data)

          if (data?.isCompleted) {
            stopPolling()
            setIsGeneratingRoadmap(false)
          } else if (data?.isError) {
            stopPolling()
            setIsGeneratingRoadmap(false)
            setGenerateError(
              data?.errorMessage || 'Có lỗi xảy ra trong quá trình tạo lộ trình.'
            )
          }
        } catch (err) {
          console.error('Progress polling error:', err)
        }
      }, 2000)
    },
    [stopPolling]
  )

  const fetchFeedback = useCallback(async () => {
    if (!isEntrance || !userExamId || !Number.isFinite(targetAim)) {
      setFeedbackLoading(false)
      return
    }

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
    } catch (err) {
      console.error('Failed to fetch roadmap feedback:', err)
      setFeedbackError('Không thể tải thông tin phản hồi. Vui lòng thử lại.')
    } finally {
      setFeedbackLoading(false)
    }
  }, [isEntrance, userExamId, targetAim])

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchFeedback()
    }
  }, [fetchFeedback])

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
        }, {
          timeout: 0,
        })

        const jobId = response?.data?.data
        if (jobId) {
          setProgressData({ percent: 0, step: 'Đang bắt đầu...', isCompleted: false })
          pollProgress(jobId)
        } else {
          setIsGeneratingRoadmap(false)
        }
        return jobId
      } catch (err) {
        console.error('Failed to generate roadmap:', err)
        setGenerateError('Không thể tạo lộ trình. Vui lòng thử lại.')
        setIsGeneratingRoadmap(false)
        return null
      }
    },
    [isEntrance, userExamId, targetAim, pollProgress]
  )

  return (
    <RoadmapGenerateLayout
      userExamId={userExamId}
      level={targetAim}
      feedbackData={feedbackData}
      feedbackLoading={feedbackLoading}
      feedbackError={feedbackError}
      onGenerateRoadmap={handleGenerateRoadmap}
      isGeneratingRoadmap={isGeneratingRoadmap}
      generateError={generateError}
      progressData={progressData}
      isEntrance={isEntrance}

    />
  )
}
