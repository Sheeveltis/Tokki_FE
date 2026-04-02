import { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import { getMenuStudyRoute, isLoginRequiredModule } from './menuStudyRoutes'
import { getAccountAimLevel } from '@tokki/app/features/authentication/api'

/**
 * Hook xử lý logic cho MenuStudyScreen (Native)
 * Sử dụng React Navigation thay vì solito router
 * @param {import('@react-navigation/native').NavigationProp} navigation
 * @param {number} levelId
 */
export function useMenuStudy(navigation, levelId) {
  const [showLoginRequest, setShowLoginRequest] = useState(false)
  const [aimLevel, setAimLevel] = useState(null)

  useEffect(() => {
    const fetchAimLevel = async () => {
      const result = await getAccountAimLevel()
      if (result.isSuccess) {
        setAimLevel(result.data)
      }
    }
    fetchAimLevel()
  }, [])

  // Chuyển đổi route từ web sang React Navigation screen name
  const navigateToRoute = (route) => {
    if (!route) return

    // Parse route để lấy screen name và params
    const [path, queryString] = route.split('?')
    const params = {}
    
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=')
        if (key && value) {
          params[key] = value
        }
      })
    }

    // Map web routes sang React Navigation screen names
    const routeMap = {
      '/flashcard': 'flashcard-list',
      '/pronunciation': 'pronunciation',
      '/speaking': 'pronunciation',
      '/alphabet': 'alphabet', // Cần thêm screen này nếu chưa có
      '/minigame': 'minigame', // Cần thêm screen này nếu chưa có
      '/roadmap/info': 'roadmap-info',
      '/roadmap/learning': 'roadmap-info', // Có thể dùng chung với roadmap-info
      // Thêm các route khác khi cần
    }

    const screenName = routeMap[path] || path.replace('/', '').replace(/\//g, '-')
    
    if (screenName && navigation) {
      navigation.navigate(screenName, params)
    }
  }

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
      navigateToRoute(route)
    }
  }

  const handleAlphabetPress = () => {
    navigateToRoute('/alphabet')
  }

  const handleTopikRoadmapPress = (overrideLevel) => {
    const finalLevel = overrideLevel || levelId
    if (!finalLevel) {
      navigateToRoute('/roadmap/info')
      return
    }
    navigateToRoute(`/roadmap/learning?level=${finalLevel}`)
  }

  return {
    showLoginRequest,
    setShowLoginRequest,
    handleModulePress,
    handleAlphabetPress,
    handleTopikRoadmapPress,
    aimLevel,
  }
}
