'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useMenuStudy } from './useMenuStudy'
import { 
  MenuStudyLayout as WebLayout,
  MenuStudyMain as WebMain,
  MenuStudyLayoutMobile as MobileLayout,
  MenuStudyMainMobile as MobileMain
} from './components'

/**
 * MenuStudy: Trang menu học tập cho từng level
 * Điều phối giữa web và mobile layout
 * @param {{
 *   levelId?: number
 *   onBackPress?: () => void
 *   onQuickTestPress?: () => void
 *   lessonsLearned?: number
 *   streakDays?: number
 * }} props
 */
export function MenuStudy({
  levelId = null,
  onBackPress,
  onQuickTestPress,
  lessonsLearned,
  streakDays,
}) {
  const router = useRouter()
  const {
    showLoginRequest,
    setShowLoginRequest,
    handleModulePress,
    handleAlphabetPress,
    handleTopikRoadmapPress,
    aimLevel,
    streakData,
  } = useMenuStudy(router, levelId)

  // Chỉ sử dụng levelId từ props hoặc params, không tự động fallback về aimLevel
  const currentLevel = levelId

  // Chỉ sử dụng levelId từ props hoặc params, không tự động fallback về aimLevel

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  // Dữ liệu streak ưu tiên từ API hook, sau đó mới đến props
  const finalStreakDays = streakData?.currentStreak ?? streakDays
  const isCompletedToday = streakData?.isCompletedToday ?? false

  return (
    <Layout
      levelId={currentLevel}
      onBackPress={onBackPress}
      onQuickTestPress={onQuickTestPress}
      lessonsLearned={lessonsLearned}
      streakDays={finalStreakDays}
      isCompletedToday={isCompletedToday}
      aimLevel={aimLevel}
    >
      <Main
        levelId={currentLevel}
        streakDays={finalStreakDays}
        isCompletedToday={isCompletedToday}
        lessonsLearned={lessonsLearned}
        onModulePress={(moduleId, label) => handleModulePress(moduleId, label, currentLevel)}
        showLoginRequest={showLoginRequest}
        onCloseLoginRequest={() => setShowLoginRequest(false)}
        onAlphabetPress={handleAlphabetPress}
        onTopikRoadmapPress={() => handleTopikRoadmapPress(currentLevel)}
        aimLevel={aimLevel}
      />
    </Layout>
  )
}

export default MenuStudy
