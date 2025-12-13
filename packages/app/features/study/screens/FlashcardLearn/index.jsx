'use client'

import React from 'react'
import { Platform } from 'react-native'
import { useFlashcardLearn } from './useFlashcardLearn'
import { 
  FlashcardLearnLayout as WebLayout,
  FlashcardLearnMain as WebMain,
  FlashcardLearnLayoutMobile as MobileLayout,
  FlashcardLearnMainMobile as MobileMain
} from '../../components/flashcard/flashcard-learn'

/**
 * LearnScreen: Trang học flashcard chi tiết
 * Điều phối giữa web và mobile layout
 * @param {{
 *   topicId?: string
 *   title?: string
 *   onBackPress?: () => void
 * }} props
 */
export function LearnScreen({
  topicId,
  title = 'Học Từ Vựng',
  onBackPress,
}) {
  const {
    flashcards,
    index,
    isFlipped,
    learned,
    loading,
    error,
    current,
    isFavorite,
    isLearned,
    progress,
    handleNext,
    handlePrev,
    toggleFavorite,
    markAsLearned,
    setIsFlipped,
    fetchFlashcards,
  } = useFlashcardLearn(topicId)

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        title={title}
        current={current}
        currentIndex={index}
        total={flashcards.length}
        isFlipped={isFlipped}
        isFavorite={isFavorite}
        isLearned={isLearned}
        progress={progress}
        learnedCount={learned.size}
        loading={loading}
        error={error}
        flashcards={flashcards}
        onBackPress={onBackPress}
        onFlip={setIsFlipped}
        onToggleFavorite={toggleFavorite}
        onMarkAsLearned={markAsLearned}
        onNext={handleNext}
        onPrev={handlePrev}
        onRetry={fetchFlashcards}
      />
    </Layout>
  )
}

export default LearnScreen
