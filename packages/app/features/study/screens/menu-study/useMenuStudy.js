import { useState, useEffect } from 'react'
import { getMenuStudyRoute, isLoginRequiredModule } from './menuStudyRoutes'
import { getAccountAimLevel, getMyStreak, checkDailyTitles } from '@tokki/app/features/authentication/api'
import { getCurrentWeekProgress, getGamificationProgress, getLeaderboardData } from '@tokki/app/features/study/api'

// Biến global trong module để theo dõi việc check danh hiệu trong 1 phiên chạy app
let hasCheckedDailyTitlesInSession = false

export const resetTitlesCheck = () => {
  hasCheckedDailyTitlesInSession = false
}

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
  const [roadmapData, setRoadmapData] = useState(null)
  const [gamificationData, setGamificationData] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loadingRoadmap, setLoadingRoadmap] = useState(true)
  const [unlockedTitles, setUnlockedTitles] = useState([])
  const [showTitlesModal, setShowTitlesModal] = useState(false)

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
    const fetchRoadmap = async () => {
      setLoadingRoadmap(true)
      const data = await getCurrentWeekProgress()
      setRoadmapData(data)
      setLoadingRoadmap(false)
    }
    const fetchGamification = async () => {
      const data = await getGamificationProgress()
      if (data) setGamificationData(data)
    }
    const fetchLeaderboard = async () => {
      const data = await getLeaderboardData()
      setLeaderboardData(data)
    }
    const checkTitles = async () => {
      // Chỉ kiểm tra 1 lần mỗi khi load app (session) để tránh hiện đi hiện lại khi chuyển trang
      if (hasCheckedDailyTitlesInSession) {
        return
      }

      const result = await checkDailyTitles()
      if (result && result.isSuccess && result.data && result.data.length > 0) {
        setUnlockedTitles(result.data)
        setShowTitlesModal(true)
        
        // Đánh dấu đã hiện trong session này
        hasCheckedDailyTitlesInSession = true
      }
    }

    fetchAimLevel()
    fetchStreak()
    fetchRoadmap()
    fetchGamification()
    fetchLeaderboard()
    checkTitles()
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
    roadmapData,
    gamificationData,
    leaderboardData,
    unlockedTitles,
    showTitlesModal,
    setShowTitlesModal,
  }
}

