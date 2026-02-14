import { useState } from 'react'
import { getMenuStudyRoute, isLoginRequiredModule } from './menuStudyRoutes'

/**
 * Hook xử lý logic cho MenuStudyScreen
 * @param {import('next/navigation').AppRouterInstance} router
 * @param {number} levelId
 */
export function useMenuStudy(router, levelId) {
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  const handleModulePress = (moduleId, itemLabel) => {
    // Các module yêu cầu đăng nhập
    if (isLoginRequiredModule(moduleId)) {
      setShowLoginRequest(true)
      return
    }

    // Lấy route tương ứng và điều hướng nếu có
    const route = getMenuStudyRoute({ moduleId, itemLabel, levelId })
    if (route) {
      router.push(route)
    }
  }

  const handleAlphabetPress = () => {
    router.push('/alphabet')
  }

  const handleTopikRoadmapPress = () => {
    if (!levelId) {
      router.push('/roadmap/info')
      return
    }
    router.push(`/roadmap/learning?level=${levelId}`)
  }

  return {
    showLoginRequest,
    setShowLoginRequest,
    handleModulePress,
    handleAlphabetPress,
    handleTopikRoadmapPress,
  }
}

