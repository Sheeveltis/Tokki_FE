'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useStudySelection } from './useStudySelection'
import { 
  StudySelectionLayout as WebLayout,
  StudySelectionMain as WebMain,
  StudySelectionLayoutMobile as MobileLayout,
  StudySelectionMainMobile as MobileMain
} from './components'

/**
 * StudySelection: Trang chọn lộ trình học dựa trên các level
 * Điều phối giữa web và mobile layout
 * - Hiển thị menu 6 level
 * - Hỗ trợ callback khi chọn level
 * @param {{
 *   onSelectLevel?: (levelId: number) => void
 *   onQuickTestPress?: () => void
 *   lessonsLearned?: number
 *   streakDays?: number
 * }} props
 */
export function StudySelection({ 
  onSelectLevel, 
  onQuickTestPress, 
  lessonsLearned, 
  streakDays 
}) {
  const {
    hoveredLevel,
    handleHoverIn,
    handleHoverOut,
  } = useStudySelection()

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout
      onQuickTestPress={onQuickTestPress}
      lessonsLearned={lessonsLearned}
      streakDays={streakDays}
    >
      <Main
        onSelectLevel={onSelectLevel}
        hoveredLevel={hoveredLevel}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
      />
    </Layout>
  )
}

export default StudySelection
