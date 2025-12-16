import { useState } from 'react'

/**
 * Hook xử lý logic cho MenuStudyScreen
 * @param {import('next/navigation').AppRouterInstance} router
 * @param {number} levelId
 */
export function useMenuStudy(router, levelId) {
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  const handleModulePress = (moduleId) => {
    if (moduleId === 'vocabulary') {
      // Đi tới trang flashcard kèm theo level hiện tại
      if (levelId) {
        router.push(`/flashcard?level=${levelId}`)
      } else {
        router.push('/flashcard')
      }
      return
    }
    if (moduleId === 'alphabet') {
      router.push('/alphabet')
      return
    }
    if (moduleId === 'speaking' || moduleId === 'writing') {
      setShowLoginRequest(true)
      return
    }
  }

  const handleAlphabetPress = () => {
    router.push('/alphabet')
  }

  return {
    showLoginRequest,
    setShowLoginRequest,
    handleModulePress,
    handleAlphabetPress,
  }
}

