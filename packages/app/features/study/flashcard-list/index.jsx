'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useFlashcardList } from './useFlashcardList'
import { 
  FlashcardListLayout as WebLayout,
  FlashcardListMain as WebMain,
  FlashcardListLayoutMobile as MobileLayout,
  FlashcardListMainMobile as MobileMain
} from './components'

/**
 * FlashcardListScreen: Trang danh sách flashcard
 * Điều phối giữa web và mobile layout
 */
export function FlashcardListScreen({ 
  onTopicPress, 
  onBackPress, 
  title = 'Flashcard', 
  levelId 
}) {
  const {
    topics,
    loading,
    error,
    fetchTopics,
  } = useFlashcardList(levelId)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        title={title}
        topics={topics}
        loading={loading}
        error={error}
        onBackPress={onBackPress}
        onTopicPress={onTopicPress}
        onRetry={fetchTopics}
      />
    </Layout>
  )
}

export default FlashcardListScreen
