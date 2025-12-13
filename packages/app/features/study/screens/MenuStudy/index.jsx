'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'next/navigation'
import { useMenuStudy } from './useMenuStudy'
import { 
  MenuStudyLayout as WebLayout,
  MenuStudyMain as WebMain,
  MenuStudyLayoutMobile as MobileLayout,
  MenuStudyMainMobile as MobileMain
} from '../../components/menu-study'

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
  levelId = 1,
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
  } = useMenuStudy(router)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout
      levelId={levelId}
      onBackPress={onBackPress}
      onQuickTestPress={onQuickTestPress}
      lessonsLearned={lessonsLearned}
      streakDays={streakDays}
    >
      <Main
        levelId={levelId}
        onModulePress={handleModulePress}
        showLoginRequest={showLoginRequest}
        onCloseLoginRequest={() => setShowLoginRequest(false)}
        onAlphabetPress={handleAlphabetPress}
      />
    </Layout>
  )
}

export default MenuStudy
