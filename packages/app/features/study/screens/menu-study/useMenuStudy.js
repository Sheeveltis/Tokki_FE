import { useState, useEffect } from 'react'
import { getMenuStudyRoute, isLoginRequiredModule } from './menuStudyRoutes'
import { getAccountAimLevel, getMyStreak } from '@tokki/app/features/authentication/api'

/**
 * Hook xử lý logic cho MenuStudyScreen
 * @param {import('next/navigation').AppRouterInstance} router
 * @param {number} levelId
 */
export function useMenuStudy(router, levelId) {
  const [showLoginRequest, setShowLoginRequest] = useState(false)
  const [aimLevel, setAimLevel] = useState(null)
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    isCompletedToday: false
  })

  useEffect(() => {
    const fetchAimLevel = async () => {
      const result = await getAccountAimLevel()
      if (result.isSuccess) {
        setAimLevel(result.data)
      }
    }
    const fetchStreak = async () => {
      const result = await getMyStreak()
      if (result && (result.isSuccess || result.currentStreak !== undefined)) {
        // API response provided by user has currentStreak, isCompletedToday
        // If it returns the same format as in the request
        const data = result.data || result
        setStreakData({
          currentStreak: data.currentStreak ?? 0,
          isCompletedToday: data.isCompletedToday ?? false
        })
      }
    }
    fetchAimLevel()
    fetchStreak()
  }, [])

  const handleModulePress = (moduleId, itemLabel, overrideLevel) => {
    const finalLevel = overrideLevel || levelId
    // Tạm thời bỏ chặn đăng nhập cho speaking để vào màn pronunciation theo yêu cầu
    const shouldRequireLogin = isLoginRequiredModule(moduleId) && moduleId !== 'speaking'
    if (shouldRequireLogin) {
      setShowLoginRequest(true)
      return
    }

    // Lấy route tương ứng và điều hướng nếu có
    const route = getMenuStudyRoute({ moduleId, itemLabel, levelId: finalLevel })
    if (route) {
      router.push(route)
    }
  }

  const handleAlphabetPress = () => {
    router.push('/alphabet')
  }

  const handleTopikRoadmapPress = (overrideLevel) => {
    const finalLevel = overrideLevel || levelId
    if (!finalLevel) {
      router.push('/roadmap/info')
      return
    }
    router.push(`/roadmap/learning?level=${finalLevel}`)
  }

  return {
    showLoginRequest,
    setShowLoginRequest,
    handleModulePress,
    handleAlphabetPress,
    handleTopikRoadmapPress,
    aimLevel,
    streakData,
  }
}

