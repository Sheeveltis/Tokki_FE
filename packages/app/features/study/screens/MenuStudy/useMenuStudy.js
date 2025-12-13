import { useState } from 'react'

/**
 * Hook xử lý logic cho MenuStudyScreen
 */
export function useMenuStudy(router) {
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  const handleModulePress = (moduleId) => {
    if (moduleId === 'vocabulary') {
      router.push('/flashcard')
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

