import { useState } from 'react'
import { Platform } from 'react-native'

/**
 * Hook xử lý logic cho StudySelectionScreen
 */
export function useStudySelection() {
  const [hoveredLevel, setHoveredLevel] = useState(null)

  const handleHoverIn = (levelId) => {
    if (Platform.OS === 'web') {
      setHoveredLevel(levelId)
    }
  }

  const handleHoverOut = () => {
    if (Platform.OS === 'web') {
      setHoveredLevel(null)
    }
  }

  return {
    hoveredLevel,
    handleHoverIn,
    handleHoverOut,
  }
}

