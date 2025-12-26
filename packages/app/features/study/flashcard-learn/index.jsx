'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import { useFlashcardLearn } from './useFlashcardLearn'
import { 
  FlashcardLearnLayout as WebLayout,
  FlashcardLearnMain as WebMain,
  FlashcardLearnLayoutMobile as MobileLayout,
  FlashcardLearnMainMobile as MobileMain
} from './components'

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
  isFavoritesMode = false,
}) {
  const [slideDirection, setSlideDirection] = useState(null) // 'left' | 'right' | null
  
  const {
    flashcards,
    unlearnedFlashcards,
    index,
    isFlipped,
    learned,
    showInstructions,
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
    markAsNeedReview,
    setIsFlipped,
    setShowInstructions,
    fetchFlashcards,
    toggleShuffle,
    isShuffled,
  } = useFlashcardLearn(topicId, isFavoritesMode)

  const handleMarkAsLearned = useCallback(() => {
    setSlideDirection('right')
    markAsLearned()
    setTimeout(() => {
      handleNext()
      setSlideDirection(null)
    }, 300)
  }, [markAsLearned, handleNext])

  const handleMarkAsNeedReview = useCallback(() => {
    setSlideDirection('left')
    markAsNeedReview()
    setTimeout(() => {
      handleNext()
      setSlideDirection(null)
    }, 300)
  }, [markAsNeedReview, handleNext])

  // Xử lý keyboard events cho mũi tên trái/phải
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleMarkAsNeedReview()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleMarkAsLearned()
      }
    }

    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleMarkAsLearned, handleMarkAsNeedReview])

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <Layout>
      <Main
        title={title}
        current={current}
        currentIndex={index}
        total={flashcards.length}
        unlearnedCount={unlearnedFlashcards.length}
        isFlipped={isFlipped}
        isFavorite={isFavorite}
        isLearned={isLearned}
        progress={progress}
        learnedCount={learned.size}
        slideDirection={slideDirection}
        showInstructions={showInstructions}
        loading={loading}
        error={error}
        flashcards={flashcards}
        onBackPress={onBackPress}
        onFlip={setIsFlipped}
        onToggleFavorite={toggleFavorite}
        onMarkAsLearned={handleMarkAsLearned}
        onMarkAsNeedReview={handleMarkAsNeedReview}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleInstructions={() => setShowInstructions(!showInstructions)}
        onRetry={fetchFlashcards}
        onShuffle={toggleShuffle}
        isShuffled={isShuffled}
      />
    </Layout>
  )
}

export default LearnScreen
